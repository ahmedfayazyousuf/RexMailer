import { FaTrashCan } from "react-icons/fa6";
// import { HiMiniArrowLongRight } from "react-icons/hi2";
import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const AddressBooks = () => {
  const [addressBooks, setAddressBooks] = useState([]);
  const [newBookName, setNewBookName] = useState('');
  const [deleteBookId, setDeleteBookId] = useState(null); // Track which book to delete
  const [inputError, setInputError] = useState('');
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
  }, [db, deleteBookId]); // Update list when a book is deleted

  const handleAddressBookClick = (id) => {
    navigate(`/AddressBook/${id}`);
  };

  const handleNewBookNameChange = (event) => {
    setNewBookName(event.target.value);
    if (inputError && event.target.value.trim().length <= 25) {
      setInputError('');
    }
  };

  const handleCreateNewBook = async () => {
    document.getElementById('CreateNewButton').innerHTML = "Loading..."
    if (newBookName.trim() === '') {
      setInputError('Please enter a name for the new address book.');
      document.getElementById('CreateNewButton').innerHTML = "Create New Address Book";
      setTimeout(() => setInputError(''), 5000);
      return;
    }

    if (newBookName.trim().length > 25) {
      setInputError('Address book name should not exceed 25 characters.');
      document.getElementById('CreateNewButton').innerHTML = "Create New Address Book";
      setTimeout(() => setInputError(''), 5000);
      return;
    }

    try {
      const timestamp = new Date(); // Client-side timestamp
      const docRef = await addDoc(collection(db, 'Contacts'), {
        name: newBookName.trim(),
        timestamp, // Add timestamp field
        contacts: [] // Initial empty contacts array
      });
      const newBook = { id: docRef.id, name: newBookName.trim(), timestamp }; // Include timestamp in newBook
      setAddressBooks(prevAddressBooks => [...prevAddressBooks, newBook]);
      setNewBookName(''); // Clear input field after successful creation
      setInputError(''); // Clear any existing input error
    } catch (error) {
      console.error('Error creating new address book:', error);
    }
    document.getElementById('CreateNewButton').innerHTML = "Create New Address Book";
  };

  const handleDeleteBook = async (id) => {
    try {
      await deleteDoc(doc(db, 'Contacts', id));
      setDeleteBookId(id); // Trigger useEffect to update addressBooks state
    } catch (error) {
      console.error('Error deleting address book:', error);
    }
  };

  return (
    <div className='MainDiv' style={{ paddingTop: '70px', minHeight: '100vh', justifyContent: 'flex-start', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2 style={{ textAlign: 'center', margin: '0', marginBottom: '20px' }}>
        <span>Manage </span><span style={{ color: '#FF3380', fontWeight: '900' }}>Address Books</span>
      </h2>

      <div style={{ marginBottom: '20px', width: '100%', maxWidth: '400px', padding: '0 20px' }}>
        <input id="NewAddressBookName" type="text" value={newBookName} onChange={handleNewBookNameChange} placeholder="Enter new address book name" style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
        <button id="CreateNewButton" onClick={handleCreateNewBook} style={{ width: '100%', marginTop: '8px', padding: '10px', background: '#FF3380', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }} > Create New Address Book </button>
        <p style={{ color: 'red', margin: '4px 0px 0px 0px', textAlign: 'center', height: '10px', fontSize: '12px' }}>{inputError}</p>
        
      </div>

      <ul style={{ width: '100%', maxWidth: '400px', padding: '0px 10px', listStyleType: 'none', marginTop: '-5px'}}>
        <p style={{padding: '0', margin: '0', width: '100%', textAlign: 'center'}}>Address Books:</p>
        {addressBooks.map(book => (
          <li key={book.id} className='AddressBookButton' style={{ position: 'relative', marginBottom: '10px' }}>
            <div onClick={() => handleAddressBookClick(book.id)} style={{ cursor: 'pointer', display: 'flex', padding: '0px 0px 0px 10px', justifyContent: 'flex-start', alignItems: 'center', width: '100%', height: '100%'}}>
              {book.name || 'Unnamed Address Book'}
              {book.timestamp && (
                <span style={{ marginLeft: '10px', fontSize: '11px', color: '#777', position: 'absolute', right: '47px', padding: '0', margin: '0'}}>
                  {new Date(book.timestamp.seconds * 1000).toLocaleDateString()} at {new Date(book.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', hour12: true })}
                </span>
              )}

            </div>
            <button onClick={() => handleDeleteBook(book.id)} style={{ height: '40px', width: '40px', backgroundColor: 'transparent', position: 'absolute', right: '0', top: '0', border: '1px solid #FF0000', color: '#FF0000', borderRadius: '5px', cursor: 'pointer', padding: '5px', zIndex: '2' }}><FaTrashCan/></button>
            {/* <HiMiniArrowLongRight style={{ position: 'absolute', right: '24px', fontSize: '20px', top: '50%', transform: 'translateY(-50%)' }} /> */}
          </li>
        ))}
      </ul>

    </div>
  );
};

export default AddressBooks;
