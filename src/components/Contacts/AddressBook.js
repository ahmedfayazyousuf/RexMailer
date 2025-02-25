import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
import { FaTrashCan } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import { FaPlus } from "react-icons/fa";
import * as XLSX from 'xlsx';

const AddressBook = () => {
  const fileInputRef = useRef(null);
  const [contacts, setContacts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [excelFile, setExcelFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const modalRef = useRef(null);
  const db = getFirestore();
  const { id } = useParams();

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        console.log(`Fetching contacts for document ID: ${id}`);
        const docRef = doc(db, 'Contacts', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setContacts(docSnap.data().contacts || []);
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error('Error fetching document:', error);
      }
    };
    fetchContacts();
  }, [id, db]);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleAddContact = async () => {
    if (name && email) {
      const newContact = {
        name,
        email,
        timestamp: new Date()
      };
      const updatedContacts = [...contacts, newContact];
      await updateDoc(doc(db, 'Contacts', id), {
        contacts: updatedContacts
      });
      setContacts(updatedContacts);
      setShowModal(false);
      setName('');
      setEmail('');
    }
  };

  const convertFirestoreTimestampToDate = (timestamp) => {
    if (!timestamp) return null;
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000);
    }
    return new Date(timestamp);
  };

  const handleDeleteContact = async (index) => {
    const updatedContacts = contacts.filter((_, i) => i !== index);
    await updateDoc(doc(db, 'Contacts', id), {
      contacts: updatedContacts
    });
    setContacts(updatedContacts);
  };

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setShowModal(false);
    }
  };

  useEffect(() => {
    if (showModal) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showModal]);

  const handleExcelUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setExcelFile(file);
      setFileName(file.name);
    }
    // Reset the input value
    event.target.value = null;
  };
  

  const handleBulkUpload = async () => {
    document.getElementById("uploadBulkButton").innerHTML = "Loading...";
    if (!excelFile) {
      console.error('No file uploaded');
      document.getElementById("uploadBulkButton").innerHTML = "Upload Bulk Contacts";
      document.getElementById("MessageBulk").innerHTML = "No file uploaded!";
      setTimeout(() => {
        document.getElementById('MessageBulk').innerHTML = "";
      }, 4000);
      return;
    }
  
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  
        console.log('Excel data:', json); // Log the data for debugging
  
        // Filter out empty rows
        const filteredData = json.slice(1).filter(row => row.length === 2 && row[0] && row[1]);
  
        console.log('Filtered data:', filteredData); // Log the filtered data
  
        const newContacts = filteredData.map(row => ({
          name: row[0],
          email: row[1],
          timestamp: new Date()
        }));
  
        console.log('Parsed contacts:', newContacts); // Log the parsed contacts
  
        // Check for undefined fields
        const invalidContacts = newContacts.filter(contact => !contact.name || !contact.email || !contact.timestamp);
        if (invalidContacts.length > 0) {
          console.error('Invalid contacts found:', invalidContacts);
          return;
        }
  
        const updatedContacts = [...contacts, ...newContacts];
        console.log('Updated contacts:', updatedContacts); // Log the updated contacts
  
        await updateDoc(doc(db, 'Contacts', id), {
          contacts: updatedContacts
        });
  
        setContacts(updatedContacts);
        setExcelFile(null);
        setFileName('');
        document.getElementById("MessageBulk").innerHTML = "";
        document.getElementById("uploadBulkButton").innerHTML = "Upload Bulk Contacts";
      } catch (error) {
        console.error('Error processing file:', error);
      }
    };
    reader.readAsArrayBuffer(excelFile);
  };
  
  

  return (
    <div className='MainDiv' style={{ padding: '70px 0px', minHeight: '100vh', justifyContent: 'flex-start' }}>
      <h2 style={{ textAlign: 'center', margin: '0' }}>
        <span>Manage </span>
        <span style={{ color: '#FF3380', fontWeight: '900' }}>Contacts</span>
      </h2>

      <button onClick={() => setShowModal(true)} style={{ position: 'absolute', top: '60px', height: '50px', width: '50px', right: '10px', background: '#FF3380', color: 'white', border: 'none', borderRadius: '100px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
        <FaPlus style={{ padding: '0', margin: '0'}} />
      </button>

      <div style={{ display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '10px' }}>
        <p style={{ textAlign: 'center', maxWidth: '440px', fontSize: '14px' }}>To add bulk contacts, upload an excel file (.xlsx) with the first column containing contact names, and the second column their email addresses.</p>
        
        <div style={{display: 'flex', padding: '0', margin: '0', justifyContent: 'center', alignItems: 'center', textAlign: 'center', marginTop: '-10px'}}>
          <input type="file" accept=".xlsx, .xls" onChange={handleExcelUpload} ref={fileInputRef} style={{ display: 'none' }} />
          <button onClick={handleButtonClick} style={{ padding: '5px 10px', backgroundColor: '#FF3380', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', marginRight: '10px' }} >
            Choose File
          </button>
          <span style={{fontSize: '12px'}}>{fileName}</span>
        </div>

        <button id='uploadBulkButton' onClick={handleBulkUpload} style={{ padding: '10px 20px', backgroundColor: '#46fa8b', color: 'black', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', margin: '0'}}>Upload Bulk Contacts</button>
        <div id='MessageBulk' style={{color: 'red', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', height: '20px', fontSize: '12px', marginTop: '-7px', padding: '0', width: '100%'}}></div>
      </div>

      <table className="ContactsTable" style={{marginTop: '3px'}}>
        <thead>
          <tr style={{ background: '#46fa8b', color: 'black', fontWeight: '900', textAlign: 'center', borderRadius: '15px' }}>
            <th style={{ padding: '8px', width: '50px', borderRadius: '15px 0px 0px 0px' }}>S#</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', borderTop: 'none' }}>Name</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', borderTop: 'none' }}>Email</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', borderTop: 'none' }}>Date added</th>
            <th style={{ padding: '8px', borderTop: 'none', borderRadius: '0px 15px 0px 0px' }}></th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact, index) => (
            <tr key={index} style={{ background: index % 2 === 0 ? '#c2fcd9' : '#f2fff7' }}>
              <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{index + 1}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{contact.name}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{contact.email}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                {contact.timestamp ? convertFirestoreTimestampToDate(contact.timestamp).toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', hour12: true }).replace(',', ' at') : 'N/A'}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', width: '50px' }}>
                <FaTrashCan onClick={() => handleDeleteContact(index)} style={{ color: 'red', cursor: 'pointer', fontSize: '15px', marginBottom: '-3px', padding: '0' }} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div style={{ position: 'fixed', top: '0', left: '0', width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div ref={modalRef} style={{ background: 'white', boxShadow: '0px 0px 10px rgba(0,0,0,0.1)', borderRadius: '5px', padding: '30px 40px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '10px', position: 'relative' }}>
            <h3 style={{ margin: '0', padding: '0', textAlign: 'center', width: '100%' }}>Add Contact</h3>
            <RxCross2 onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '5px', right: '5px', fontSize: '20px', color: 'grey', cursor: 'pointer' }} />
            <input type='text' placeholder='Name' value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', border: '1px solid lightgrey', color: 'grey' }} />
            <input type='email' placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', border: '1px solid lightgrey', color: 'grey' }} />
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '10px 20px', background: '#ddd', color: 'black', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '11px' }}>
                Cancel
              </button>
              <button onClick={handleAddContact} style={{ padding: '10px 20px', background: '#FF3380', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '11px' }}>
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressBook;
