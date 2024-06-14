import Illustration1 from '../1_MediaAssets/Home/Illustration1.png';
import Illustration2 from '../1_MediaAssets/Home/Illustration2.png';
import React, { useState, useEffect } from 'react';
import '../1_MediaAssets/Styles/All.css';
import { getFirestore, collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';

const SendEmails = () => {
  const [templates, setTemplates] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const db = getFirestore();

  useEffect(() => {
    const fetchTemplates = async () => {
      const querySnapshot = await getDocs(query(collection(db, 'EmailTemplates'), orderBy('timestamp', 'desc')));
      const templatesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTemplates(templatesList);
    };

    const fetchContacts = async () => {
      const querySnapshot = await getDocs(query(collection(db, 'Contacts'), orderBy('timestamp', 'desc')));
      const contactsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp ? doc.data().timestamp.toDate() : null
      }));
      setContacts(contactsList);
    };

    fetchTemplates();
    fetchContacts();
  }, [db]);

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
  };

  const handleSelectContact = (contactId) => {
    setSelectedContacts((prevSelectedContacts) => {
      if (prevSelectedContacts.includes(contactId)) {
        return prevSelectedContacts.filter(id => id !== contactId);
      } else {
        return [...prevSelectedContacts, contactId];
      }
    });
  };

  const handleCheckboxChange = (event, contactId) => {
    event.stopPropagation();
    handleSelectContact(contactId);
  };

  const handleSelectAllContacts = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map(contact => contact.id));
    }
  };

  const handleSelectRecentContacts = async () => {
    const oneDayAgo = Timestamp.now().toMillis() - (24 * 60 * 60 * 1000);
    const recentContactsQuery = query(collection(db, 'Contacts'), where('timestamp', '>=', Timestamp.fromMillis(oneDayAgo)));
    const querySnapshot = await getDocs(recentContactsQuery);
    const recentContactsList = querySnapshot.docs.map(doc => doc.id);
    setSelectedContacts(recentContactsList);
  };

  const handleSendEmails = async () => {
    if (!selectedTemplate || selectedContacts.length === 0) {
      // alert("Please select a template and at least one contact.");
      document.getElementById('ErrorText').style.color = 'red';
      document.getElementById('ErrorText').innerHTML = "Please select a template and at least one contact.";
      setTimeout(() => {
        document.getElementById('ErrorText').innerHTML = "";
      }, 4000);
      return;
    }
  
    try {
      const response = await fetch('https://rexmailerserver.vercel.app/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template: {
            title: selectedTemplate.title,
            content: selectedTemplate.htmlContent, // Assuming 'htmlContent' field in Firestore
          },
          contacts: selectedContacts.map(contactId => contacts.find(contact => contact.id === contactId)),
        }),
      });
  
      const data = await response.json();
      if (data.success) {
        // alert("Emails sent successfully!");
        document.getElementById('ErrorText').style.color = 'green';
        document.getElementById('ErrorText').innerHTML = "Emails sent successfully!";
        setTimeout(() => {
          document.getElementById('ErrorText').innerHTML = "";
        }, 4000);
      } else {
        // alert("Failed to send emails.");
        document.getElementById('ErrorText').style.color = 'red';
        document.getElementById('ErrorText').innerHTML = "Failed to send emails.";
        setTimeout(() => {
          document.getElementById('ErrorText').innerHTML = "";
        }, 4000);
      }
    } catch (error) {
      console.error('Error sending emails:', error);
      // alert("Failed to send emails. Please try again later.");
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

        <h3 style={{margin: '0', padding: '0', marginTop: '40px'}}>Step 2 - Choose Recipient Contacts</h3>
        <div className='EmailTemplatesandContactsTable' style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', fontSize: '10px', gap: '10px', padding: '0', margin: '0', marginBottom: '-15px' }}>
          <button onClick={handleSelectAllContacts} style={{ fontSize: '10px' }}>
            {selectedContacts.length === contacts.length ? 'Deselect All' : 'Select All'}
          </button>
          <button style={{fontSize: '10px'}} onClick={handleSelectRecentContacts}>Select contacts added in the past 24 hours</button>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', width: '100%', maxHeight: '400px', overflowY: 'scroll', padding: '0', marginTop: '20px'}}>
          <table className="EmailTemplatesandContactsTable">
            <thead>
              <tr style={{ color: 'black', fontWeight: '900', textAlign: 'center', borderRadius: '15px', position: 'sticky', top: '0', width: '100%'}}>
                <th style={{ padding: '8px', width: '50px', borderRadius: '15px 0px 0px 0px', background: '#46fa8b'}}>Select</th>
                <th style={{ padding: '8px', background: '#46fa8b' }}>Name</th>
                <th style={{ padding: '8px', background: '#46fa8b' }}>Email</th>
                <th style={{ padding: '8px', borderRadius: '0px 15px 0px 0px', background: '#46fa8b'}}>Date added</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact, index) => (
                <tr key={contact.id} style={{ background: index % 2 === 0 ? '#c2fcd9' : '#f2fff7', cursor: 'pointer' }} onClick={() => handleSelectContact(contact.id)} >
                  <td style={{ textAlign: 'center', border: '1px solid #ddd', padding: '8px' }}>
                    <input type="checkbox" checked={selectedContacts.includes(contact.id)} onChange={(e) => handleCheckboxChange(e, contact.id)} />
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{contact.name}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{contact.email}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{contact.timestamp ? contact.timestamp.toLocaleString() : 'N/A'}</td>
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
