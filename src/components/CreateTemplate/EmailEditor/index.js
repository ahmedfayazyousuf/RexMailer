import React, { useState, useRef, useEffect } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { getFirestore, collection, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../Firebase';

const EmailEditor = () => {
  const [editorContent, setEditorContent] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [templateTitle, setTemplateTitle] = useState('');
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
    document.getElementById('SubmitButton').innerHTML ="Loading...";

    if (!templateTitle) {
      document.getElementById('ErrorText').style.color = 'red';
      document.getElementById('ErrorText').innerHTML = "Insert template title";
      document.getElementById('SubmitButton').innerHTML = "Save";
      setTimeout(() => {
        document.getElementById('ErrorText').innerHTML = "";
      }, 4000);
      return;
    }
    
    try {
      const emailTemplateData = {
        title: templateTitle,
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
      document.getElementById('ErrorText').style.color = 'green';
      document.getElementById('ErrorText').innerHTML ="Template saved successfully!"
      setTimeout(() => {
        document.getElementById('ErrorText').innerHTML = "";
      }, 4000);

      // Clear the attachments state
      setAttachments([]);
      setTemplateTitle(''); // Clear the template title
      quillRef.current.root.innerHTML = ''; // Clear the editor content
      document.getElementById('SubmitButton').innerHTML ="Save"

    } catch (error) {
      console.error('Error saving email template:', error);
      alert('Error saving email template. Please try again.');
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f4f4f4', borderRadius: '15px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '15px' }}>
        <h4 style={{ margin: '0', padding: '0' }}>Email Editor</h4>
        <input type="text" id='' placeholder="Template title" value={templateTitle} onChange={(e) => setTemplateTitle(e.target.value)}/>
      </div>
      <div id="editor" style={{ height: '600px', marginBottom: '10px', border: '1px solid black', background: 'white' }}></div>
      <div id='ErrorText' style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', width: '100%', margin: '0px 0px 10px 0px', padding: '0', height: '15px', fontSize: '10px', color: 'red'}}></div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', width: '100%' }}>
        <input type="file" multiple accept=".pdf" onChange={handleAttachmentChange} style={{border: 'none'}} />
        <button id='SubmitButton' onClick={handleSubmit} style={{ marginLeft: '10px', width: '120px' }}>Save</button>
      </div>
    </div>
  );
};

export default EmailEditor;
