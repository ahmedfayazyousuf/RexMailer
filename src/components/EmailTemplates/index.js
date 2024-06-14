import { FaTrashCan } from "react-icons/fa6";
import { FaPlus } from "react-icons/fa";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const EmailTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const db = getFirestore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTemplates = async () => {
      const querySnapshot = await getDocs(collection(db, 'EmailTemplates'));
      const templatesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp ? doc.data().timestamp.toDate() : null
      }));
      setTemplates(templatesList);
    };
    fetchTemplates();
  }, [db]);

  const handleDeleteTemplate = async (id) => {
    await deleteDoc(doc(db, 'EmailTemplates', id));
    setTemplates(templates.filter(template => template.id !== id));
  };

  return (
    <div className='MainDiv' style={{ paddingTop: '70px', height: 'calc(100vh - 70px)', justifyContent: 'flex-start' }}>
      <h2 style={{ textAlign: 'center', margin: '0' }}>
        <span>Manage </span>
        <span style={{ color: '#FF3380', fontWeight: '900' }}>Email Templates</span>
      </h2>

      <button onClick={() => navigate('/CreateTemplate')} style={{ position: 'absolute', top: '60px', height: '50px', width: '50px', right: '10px', background: '#FF3380', color: 'white', border: 'none', borderRadius: '100px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
        <FaPlus style={{ padding: '0', margin: '0'}} />
      </button>

      <table className="ContactsTable">
        <thead>
          <tr style={{ background: '#46fa8b', color: 'black', fontWeight: '900', textAlign: 'center', borderRadius: '15px' }}>
            <th style={{ padding: '8px', width: '50px', borderRadius: '15px 0px 0px 0px' }}>S#</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', borderTop: 'none' }}>Subject</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', borderTop: 'none' }}>Date Created</th>
            <th style={{ padding: '8px', borderTop: 'none', borderRadius: '0px 15px 0px 0px' }}></th>
          </tr>
        </thead>
        <tbody>
          {templates.map((template, index) => (
            <tr key={index} style={{ background: index % 2 === 0 ? '#c2fcd9' : '#f2fff7' }}>
              <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{index + 1}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{template.title}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                {template.timestamp ? template.timestamp.toLocaleString() : 'N/A'}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', width: '50px' }}>
                <FaTrashCan onClick={() => handleDeleteTemplate(template.id)} style={{ color: 'red', cursor: 'pointer', fontSize: '15px', marginBottom: '-3px', padding: '0' }} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EmailTemplates;
