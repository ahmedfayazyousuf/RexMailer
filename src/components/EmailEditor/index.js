import React, { useState, useRef, useEffect } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

const EmailEditor = () => {
  const [editorContent, setEditorContent] = useState('');
  const [attachments, setAttachments] = useState([]);
  const quillRef = useRef(null);

  useEffect(() => {
    const quill = new Quill('#editor', {
      theme: 'snow',
      modules: {
        toolbar: {
          container: [
            [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
            [{ size: [] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
            ['link', 'image'],
            ['clean']
          ],
          handlers: {
            'image': handleImageUpload,
          }
        }
      },
      formats: [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'image'
      ]
    });
    quill.on('text-change', () => {
      setEditorContent(quill.root.innerHTML);
    });
    quillRef.current = quill;
  }, []);

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          const range = quillRef.current.getSelection();
          quillRef.current.insertEmbed(range.index, 'image', reader.result);
        };
        reader.readAsDataURL(file);
      }
    };
  };

  const handleAttachmentChange = (e) => {
    setAttachments([...e.target.files]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your email sending logic here
    console.log("Email Content:", editorContent);
    console.log("Attachments:", attachments);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f4f4f4', borderRadius: '15px'}}>
      <h2 style={{margin: '0', padding: '0', marginBottom: '15px'}}>Email Editor</h2>
      <form onSubmit={handleSubmit}>
        <div id="editor" style={{ height: '300px', marginBottom: '30px', border: '1px solid black' }}></div>
        <input
          type="file"
          multiple
          accept=".pdf"
          onChange={handleAttachmentChange}
          style={{ marginBottom: '20px' }}
        />
        <button type="submit" style={{ background: 'black', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px' }}>Send Email</button>
      </form>
    </div>
  );
};

export default EmailEditor;
