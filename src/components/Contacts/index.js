import { FaTrashCan } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import { FaPlus } from "react-icons/fa";
import React, { useState, useEffect, useRef } from 'react';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { serverTimestamp } from 'firebase/firestore';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const modalRef = useRef(null);
  const db = getFirestore();

  useEffect(() => {
    const fetchContacts = async () => {
      const querySnapshot = await getDocs(collection(db, 'Contacts'));
      const contactsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp ? doc.data().timestamp.toDate() : null
      }));
      setContacts(contactsList);
    };
    fetchContacts();
  }, [db]);

  const handleAddContact = async () => {
    if (name && email) {
      const docRef = await addDoc(collection(db, 'Contacts'), {
        name,
        email,
        timestamp: serverTimestamp()
      });
      const newContact = {
        id: docRef.id,
        name,
        email,
        timestamp: new Date() // This will show the local time until Firestore returns the actual server time
      };
      setContacts([...contacts, newContact]);
      setShowModal(false);
      setName('');
      setEmail('');
    }
  };

  const handleDeleteContact = async (id) => {
    await deleteDoc(doc(db, 'Contacts', id));
    setContacts(contacts.filter(contact => contact.id !== id));
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

  return (
    <div className='MainDiv' style={{ paddingTop: '70px', height: 'calc(100vh - 70px)', justifyContent: 'flex-start' }}>
      <h2 style={{ textAlign: 'center', margin: '0' }}>
        <span>Manage </span>
        <span style={{ color: '#FF3380', fontWeight: '900' }}>Contacts</span>
      </h2>

      <button onClick={() => setShowModal(true)} style={{ position: 'absolute', top: '60px', height: '50px', width: '50px', right: '10px', background: '#FF3380', color: 'white', border: 'none', borderRadius: '100px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
        <FaPlus style={{ padding: '0', margin: '0'}} />
      </button>

      <table className="ContactsTable">
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
                {contact.timestamp ? contact.timestamp.toLocaleString() : 'N/A'}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', width: '50px' }}>
                <FaTrashCan onClick={() => handleDeleteContact(contact.id)} style={{ color: 'red', cursor: 'pointer', fontSize: '15px', marginBottom: '-3px', padding: '0' }} />
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

export default Contacts;
