import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const AddressBooks = () => {
  const [addressBooks, setAddressBooks] = useState([]);
  const [newBookName, setNewBookName] = useState('');
  const db = getFirestore();
  const navigate = useNavigate();

  useEffect(() => {
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
    fetchAddressBooks();
  }, [db]);

  const handleAddressBookClick = (id) => {
    navigate(`/AddressBook/${id}`);
  };

  const handleNewBookNameChange = (event) => {
    setNewBookName(event.target.value);
  };

  const handleCreateNewBook = async () => {
    try {
      const docRef = await addDoc(collection(db, 'Contacts'), {
        name: newBookName,
        contacts: [] // Initial empty contacts array
      });
      const newBook = { id: docRef.id, name: newBookName };
      setAddressBooks(prevAddressBooks => [...prevAddressBooks, newBook]);
      setNewBookName(''); // Clear input field after successful creation
    } catch (error) {
      console.error('Error creating new address book:', error);
    }
  };

  return (
    <div className='MainDiv' style={{ paddingTop: '70px', height: 'calc(100vh - 70px)', justifyContent: 'flex-start' }}>
      <h2 style={{ textAlign: 'center', margin: '0' }}>
        <span>Manage </span>
        <span style={{ color: '#FF3380', fontWeight: '900' }}>Address Books</span>
      </h2>

      <div style={{ textAlign: 'center', margin: '20px' }}>
        <div style={{ marginBottom: '20px' }}>
          <input type="text" value={newBookName} onChange={handleNewBookNameChange} placeholder="Enter new address book name" style={{ marginRight: '10px', padding: '5px' }} />
          <button onClick={handleCreateNewBook} style={{ padding: '5px 10px', background: '#FF3380', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Create New Address Book</button>
        </div>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {addressBooks.map(book => (
            <li key={book.id} style={{ margin: '10px 0', cursor: 'pointer', color: '#FF3380', fontWeight: 'bold' }} onClick={() => handleAddressBookClick(book.id)}>
              {book.name || 'Unnamed Address Book'}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AddressBooks;
