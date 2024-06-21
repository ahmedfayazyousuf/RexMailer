import Illustration1 from '../1_MediaAssets/Home/Illustration1.png';
import Illustration2 from '../1_MediaAssets/Home/Illustration2.png';
import React, { useState, useEffect } from 'react';
import '../1_MediaAssets/Styles/All.css';
import { getFirestore, collection, getDocs, query, orderBy, Timestamp, doc, getDoc } from 'firebase/firestore';

const SendEmails = () => {
  const [templates, setTemplates] = useState([]);
  const [addressBooks, setAddressBooks] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedAddressBooks, setSelectedAddressBooks] = useState([]);
  const db = getFirestore();

  useEffect(() => {
    const fetchTemplates = async () => {
      const querySnapshot = await getDocs(query(collection(db, 'EmailTemplates'), orderBy('timestamp', 'desc')));
      const templatesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTemplates(templatesList);
    };

    const fetchAddressBooks = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'Contacts'));
        const addressBooksList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAddressBooks(addressBooksList);
      } catch (error) {
        console.error('Error fetching address books:', error);
      }
    };

    fetchTemplates();
    fetchAddressBooks();
  }, [db]);

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
  };

  const handleSelectAddressBook = (addressBookId) => {
    setSelectedAddressBooks((prevSelectedAddressBooks) => {
      if (prevSelectedAddressBooks.includes(addressBookId)) {
        return prevSelectedAddressBooks.filter(id => id !== addressBookId);
      } else {
        return [...prevSelectedAddressBooks, addressBookId];
      }
    });
  };

  const handleCheckboxChange = (event, addressBookId) => {
    event.stopPropagation();
    handleSelectAddressBook(addressBookId);
  };

  const handleSelectAllAddressBooks = () => {
    if (selectedAddressBooks.length === addressBooks.length) {
      setSelectedAddressBooks([]);
    } else {
      setSelectedAddressBooks(addressBooks.map(addressBook => addressBook.id));
    }
  };

  const handleSendEmails = async () => {
    if (!selectedTemplate || selectedAddressBooks.length === 0) {
      document.getElementById('ErrorText').style.color = 'red';
      document.getElementById('ErrorText').innerHTML = "Please select a template and at least one address book.";
      setTimeout(() => {
        document.getElementById('ErrorText').innerHTML = "";
      }, 4000);
      return;
    }

    try {
      const allContacts = [];
      for (const addressBookId of selectedAddressBooks) {
        const addressBookDoc = await getDoc(doc(db, 'AddressBooks', addressBookId));
        if (addressBookDoc.exists()) {
          allContacts.push(...addressBookDoc.data().contacts);
        }
      }

      const response = await fetch('https://rexmailerservernew.vercel.app/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template: {
            title: selectedTemplate.title,
            content: selectedTemplate.htmlContent,
          },
          contacts: allContacts,
        }),
      });

      const data = await response.json();
      if (data.success) {
        document.getElementById('ErrorText').style.color = 'green';
        document.getElementById('ErrorText').innerHTML = "Emails sent successfully!";
        setTimeout(() => {
          document.getElementById('ErrorText').innerHTML = "";
        }, 4000);
      } else {
        document.getElementById('ErrorText').style.color = 'red';
        document.getElementById('ErrorText').innerHTML = "Failed to send emails.";
        setTimeout(() => {
          document.getElementById('ErrorText').innerHTML = "";
        }, 4000);
      }
    } catch (error) {
      console.error('Error sending emails:', error);
      document.getElementById('ErrorText').style.color = 'red';
      document.getElementById('ErrorText').innerHTML = "Failed to send emails.";
      setTimeout(() => {
        document.getElementById('ErrorText').innerHTML = "";
      }, 4000);
    }
  };

  return (
    <div className='MainDiv' style={{ padding: '70px 0px 70px 0px', height: '100%', justifyContent: 'flex-start' }}>
      <h2 style={{ textAlign: 'center', margin: '0' }}>
        <span>Send </span>
        <span style={{ color: '#FF3380', fontWeight: '900' }}>Emails</span>
      </h2>

      <img className="DPhider HoverFloat" src={Illustration1} alt="lalaland" style={{position: 'absolute', bottom: '0', right: '0', width: '250px'}}/>
      <img className="DPhider HoverFloat" src={Illustration2} alt="lalaland" style={{position: 'absolute', top: '50px', left: '0', width: '230px'}}/>

      <div className='SendEmailsContainer'>
        <h3 style={{margin: '0', padding: '0', marginTop: '20px'}}>Step 1 - Choose Email Template</h3>
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'flex-start', width: '100%', maxHeight: '400px', overflowY: 'scroll', padding: '0', marginTop: '20px'}}>
          <table className="EmailTemplatesandContactsTable">
            <thead>
              <tr style={{ color: 'black', fontWeight: '900', textAlign: 'center', borderRadius: '15px', position: 'sticky', top: '0', width: '100%'}}>
                <th style={{ padding: '8px', width: '50px', borderRadius: '15px 0px 0px 0px', background: '#46fa8b'}}>Select</th>
                <th style={{ padding: '8px', background: '#46fa8b'}}>Subject</th>
                <th style={{ padding: '8px', borderRadius: '0px 15px 0px 0px', background: '#46fa8b'}}>Date created</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template, index) => (
                <tr key={template.id} style={{ background: index % 2 === 0 ? '#c2fcd9' : '#f2fff7', cursor: 'pointer' }} onClick={() => handleSelectTemplate(template)} >
                  <td style={{ textAlign: 'center', border: '1px solid #ddd', padding: '8px' }}>
                    <input type="radio" name="template" checked={template.id === selectedTemplate?.id} onChange={(e) => {e.stopPropagation(); handleSelectTemplate(template);}} />
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{template.title}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{new Date(template.timestamp.toDate()).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 style={{margin: '0', padding: '0', marginTop: '40px'}}>Step 2 - Choose Address Books</h3>
        <div className='EmailTemplatesandContactsTable' style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', fontSize: '10px', gap: '10px', padding: '0', margin: '0', marginBottom: '-15px' }}>
          <button onClick={handleSelectAllAddressBooks} style={{ fontSize: '10px' }}>
            {selectedAddressBooks.length === addressBooks.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', width: '100%', maxHeight: '400px', overflowY: 'scroll', padding: '0', marginTop: '20px'}}>
          <table className="EmailTemplatesandContactsTable">
            <thead>
              <tr style={{ color: 'black', fontWeight: '900', textAlign: 'center', borderRadius: '15px', position: 'sticky', top: '0', width: '100%'}}>
                <th style={{ padding: '8px', width: '50px', borderRadius: '15px 0px 0px 0px', background: '#46fa8b'}}>Select</th>
                <th style={{ padding: '8px', background: '#46fa8b' }}>Address Book Name</th>
                <th style={{ padding: '8px', borderRadius: '0px 15px 0px 0px', background: '#46fa8b'}}>Date added</th>
              </tr>
            </thead>
            <tbody>
              {addressBooks.map((addressBook, index) => (
                <tr key={addressBook.id} style={{ background: index % 2 === 0 ? '#c2fcd9' : '#f2fff7', cursor: 'pointer' }} onClick={() => handleSelectAddressBook(addressBook.id)} >
                  <td style={{ textAlign: 'center', border: '1px solid #ddd', padding: '8px' }}>
                    <input type="checkbox" checked={selectedAddressBooks.includes(addressBook.id)} onChange={(e) => handleCheckboxChange(e, addressBook.id)} />
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{addressBook.name}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{addressBook.timestamp ? addressBook.timestamp.toLocaleString() : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div id='ErrorText' style={{display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', margin: '10px 0px -10px 0px', padding: '0', height: '15px', fontSize: '12px', color: 'red'}}></div>
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button className='ButtonSendEmails' onClick={handleSendEmails}>
            Send Emails
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendEmails;
