import React, { useState, useRef, useEffect } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { getFirestore, collection, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../../Firebase';

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
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
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

  const handleAlignment = (value) => {
    const range = quillRef.current.getSelection();
    if (range) {
      quillRef.current.format('align', value);
    }
  };

  const handleSubmit = async () => {
    document.getElementById('SubmitButton').innerHTML = "Loading...";
  
    if (!templateTitle) {
      document.getElementById('ErrorText').style.color = 'red';
      document.getElementById('ErrorText').innerHTML = "Insert email subject";
      document.getElementById('SubmitButton').innerHTML = "Save";
      setTimeout(() => {
        document.getElementById('ErrorText').innerHTML = "";
      }, 4000);
      return;
    }
  
    const emailSignature = `
      <table>
        <tr>
          <td style="padding: 5px;">
            <a href="https://www.instagram.com/rexmedicalevents/" target="_blank">
              <img src="https://firebasestorage.googleapis.com/v0/b/rexmailerdatabase.appspot.com/o/SocialIcons%2FInstagram.png?alt=media&token=c824f11d-f6d5-4193-adef-d975dd2e9acc" alt="Instagram" style="width: 24px; height: 24px;">
            </a>
          </td>
          <td style="padding: 5px;">
            <a href="https://www.facebook.com/rexmedicalevents/" target="_blank">
              <img src="https://firebasestorage.googleapis.com/v0/b/rexmailerdatabase.appspot.com/o/SocialIcons%2FFacebook.png?alt=media&token=2da9f0cd-67af-4d5e-82a8-d75b8f6f8b3f" alt="Facebook" style="width: 24px; height: 24px;">
            </a>
          </td>
          <td style="padding: 5px;">
            <a href="https://wa.me/971547773686" target="_blank">
              <img src="https://firebasestorage.googleapis.com/v0/b/rexmailerdatabase.appspot.com/o/SocialIcons%2FWhatsapp.png?alt=media&token=b1600d61-6bad-471a-ba02-7f26febbcf09" alt="WhatsApp" style="width: 24px; height: 24px;">
            </a>
          </td>
          <td style="padding: 5px;">
            <a href="https://www.linkedin.com/company/rexmedicalevents/" target="_blank">
              <img src="https://firebasestorage.googleapis.com/v0/b/rexmailerdatabase.appspot.com/o/SocialIcons%2FLinkedin.png?alt=media&token=6e01de81-67c7-4ea7-8d6a-2102b1f6c67c" alt="LinkedIn" style="width: 24px; height: 24px;">
            </a>
          </td>
          <td style="padding: 5px;">
            <a href="https://www.rexmedicalevents.com/" target="_blank">
              <img src="https://firebasestorage.googleapis.com/v0/b/rexmailerdatabase.appspot.com/o/SocialIcons%2FWebsite.png?alt=media&token=2f28e356-d2ce-4f78-a931-c5afc0d656e3" alt="Website" style="width: 24px; height: 24px;">
            </a>
          </td>
        </tr>
      </table>
    `;
  
    const updatedEditorContent = `${editorContent}${emailSignature}`;
  
    try {
      const emailTemplateData = {
        title: templateTitle,
        htmlContent: updatedEditorContent,
        timestamp: serverTimestamp(),
        attachments: []
      };
      const docRef = await addDoc(collection(db, 'EmailTemplates'), emailTemplateData);
  
      // Handle image and PDF attachments
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
  
      // Update attachments in the template document
      const updatedAttachments = uploadedAttachments.map(({ downloadURL, type }) => ({
        url: downloadURL,
        type
      }));
  
      // Prepare updated HTML content with image and PDF links
      let updatedHtmlContent = updatedEditorContent; // Start with the current editor content
  
      for (const attachment of updatedAttachments) {
        if (attachment.type === 'pdf') {
          // Add PDF link to the HTML content
          updatedHtmlContent += `<p><a href="${attachment.url}" target="_blank">Link to PDF</a></p>`;
        }
      }
  
      // Update the document with attachments and updated HTML content
      await updateDoc(doc(db, 'EmailTemplates', docRef.id), {
        attachments: updatedAttachments,
        htmlContent: updatedHtmlContent
      });
  
      console.log('Email template saved with ID:', docRef.id);
      document.getElementById('ErrorText').style.color = 'green';
      document.getElementById('ErrorText').innerHTML = "Template saved successfully!";
      setTimeout(() => {
        document.getElementById('ErrorText').innerHTML = "";
      }, 4000);
  
      // Clear the attachments state
      setAttachments([]);
      setTemplateTitle(''); // Clear the template title
      quillRef.current.root.innerHTML = ''; // Clear the editor content
      document.getElementById('SubmitButton').innerHTML = "Save";
  
    } catch (error) {
      console.error('Error saving email template:', error);
      alert('Error saving email template. Please try again.');
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f4f4f4', borderRadius: '15px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '15px' }}>
        <h4 style={{ margin: '0', padding: '0' }}>Email Editor</h4>
        <input type="text" id='' placeholder="Email Subject" value={templateTitle} onChange={(e) => setTemplateTitle(e.target.value)} style={{width: '45%'}}/>
      </div>
      <div id="editor" style={{ height: '600px', marginBottom: '10px', border: '1px solid black', background: 'white' }}></div>
      <div id='ErrorText' style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', width: '100%', margin: '0px 0px 10px 0px', padding: '0', height: '15px', fontSize: '10px', color: 'red'}}></div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', width: '100%' }}>
        <input type="file" multiple accept=".pdf" onChange={handleAttachmentChange} style={{border: 'none'}} />
        <button id='SubmitButton' onClick={handleSubmit} style={{ marginLeft: '10px', width: '120px' }}>Save</button>
        <select onChange={(e) => handleAlignment(e.target.value)}>
          <option value="">Align</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
          <option value="justify">Justify</option>
        </select>
      </div>
    </div>
  );
};

export default EmailEditor;
