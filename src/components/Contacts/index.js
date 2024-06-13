import { RxCross2 } from "react-icons/rx";
import { FaPlus } from "react-icons/fa";
import React, { useState, useEffect, useRef } from 'react';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';

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
      const contactsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setContacts(contactsList);
    };
    fetchContacts();
  }, [db]);

  const handleAddContact = async () => {
    if (name && email) {
      await addDoc(collection(db, 'Contacts'), { name, email });
      setContacts([...contacts, { name, email }]);
      setShowModal(false);
      setName('');
      setEmail('');
    }
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

      <button onClick={() => setShowModal(true)} style={{ position: 'absolute', top: '70px', height: '60px', width: '60px', right: '20px', background: '#FF3380', color: 'white', border: 'none', borderRadius: '100px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
        <FaPlus style={{ padding: '0', margin: '0', fontSize: '30px' }} />
      </button>

      <table style={{ width: '80%', borderCollapse: 'collapse', marginTop: '20px', fontSize: '13px' }}>
        <thead>
          <tr style={{ background: '#46fa8b', color: 'black', fontWeight: '900', textAlign: 'center', borderRadius: '15px' }}>
            <th style={{ padding: '8px', width: '50px', borderRadius: '15px 0px 0px 0px' }}>S#</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', borderTop: 'none' }}>Name</th>
            <th style={{ padding: '8px', borderTop: 'none', borderRadius: '0px 15px 0px 0px' }}>Email</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact, index) => (
            <tr key={index} style={{ background: index % 2 === 0 ? '#c2fcd9' : '#f2fff7' }}>
              <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{index + 1}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{contact.name}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{contact.email}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div style={{ position: 'fixed', top: '0', left: '0', width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div ref={modalRef} style={{ background: 'white', boxShadow: '0px 0px 10px rgba(0,0,0,0.1)', borderRadius: '5px', padding: '30px 40px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '10px', position: 'relative' }}>
            <h3 style={{ margin: '0', padding: '0', textAlign: 'center', width: '100%' }}>Add Contact</h3>
            <RxCross2 onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '5px', right: '5px', fontSize: '20px', color: 'grey', cursor: 'pointer' }} />
            <input type='text' placeholder='Name' value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%' }} />
            <input type='email' placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%' }} />
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '10px 20px', background: '#ccc', color: 'black', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '11px' }}>
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
