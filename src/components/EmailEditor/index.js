import React, { useState, useRef, useEffect } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { getFirestore, collection, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../Firebase'; // Adjust the import based on your firebase configuration file

const EmailEditor = () => {
  const [editorContent, setEditorContent] = useState('');
  const [attachments, setAttachments] = useState([]);
  const quillRef = useRef(null);
  const db = getFirestore();

  useEffect(() => {
    const quill = new Quill('#editor', {
      theme: 'snow',
      modules: {
        toolbar: {
          container: [
            [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
            [{ size: [] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'image'],
            ['clean']
          ],
          handlers: {
            'image': () => handleImageUpload(quill)
          }
        }
      }
    });
    quill.on('text-change', () => {
      setEditorContent(quill.root.innerHTML);
    });
    quillRef.current = quill;
  }, []);

  const handleImageUpload = async (quill) => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        const filePath = `EmailTemplates/temp/${file.name}`;
        const fileRef = ref(storage, filePath);
        const uploadTask = uploadBytesResumable(fileRef, file);

        uploadTask.on(
          'state_changed',
          null,
          (error) => {
            console.error('Error uploading image:', error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              const range = quill.getSelection();
              quill.insertEmbed(range.index, 'image', downloadURL);
              quill.setSelection(range.index + 1);
              setAttachments((prevAttachments) => [...prevAttachments, { file, downloadURL, type: 'image' }]);
            });
          }
        );
      }
    };
  };

  const handleAttachmentChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments((prevAttachments) => [
      ...prevAttachments,
      ...files.map((file) => ({ file, type: 'pdf' }))
    ]);
  };

  const handleSubmit = async () => {
    try {
      const emailTemplateData = {
        htmlContent: editorContent,
        timestamp: serverTimestamp(),
        attachments: []
      };
      const docRef = await addDoc(collection(db, 'EmailTemplates'), emailTemplateData);

      const attachmentPromises = attachments.map(async (attachment) => {
        const { file, type } = attachment;
        const filePath = `EmailTemplates/${docRef.id}/${file.name}`;
        const fileRef = ref(storage, filePath);
        const uploadTask = uploadBytesResumable(fileRef, file);

        return new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            null,
            (error) => {
              console.error('Error uploading attachment:', error);
              reject(error);
            },
            () => {
              getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                resolve({ file, downloadURL, type });
              });
            }
          );
        });
      });

      const uploadedAttachments = await Promise.all(attachmentPromises);

      const updatedAttachments = uploadedAttachments.map(({ downloadURL, type }) => ({
        url: downloadURL,
        type
      }));

      await updateDoc(doc(db, 'EmailTemplates', docRef.id), {
        attachments: updatedAttachments
      });

      console.log('Email template saved with ID:', docRef.id);
      alert('Email template saved successfully!');

      // Clear the attachments state
      setAttachments([]);
    } catch (error) {
      console.error('Error saving email template:', error);
      alert('Error saving email template. Please try again.');
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f4f4f4', borderRadius: '15px' }}>
      <h2 style={{ margin: '0', padding: '0', marginBottom: '15px' }}>Email Editor</h2>
      <div id="editor" style={{ height: '600px', marginBottom: '30px', border: '1px solid black', background: 'white' }}>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', width: '100%' }}>
        <input type="file" multiple accept=".pdf" onChange={handleAttachmentChange} />
        <button onClick={handleSubmit}>Save template</button>
      </div>
    </div>
  );
};

export default EmailEditor;
