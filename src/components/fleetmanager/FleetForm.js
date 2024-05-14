import React, {useState, useEffect} from 'react'
import FleetSpecifics from './FleetSpecifics';
import './fleetform.css'
import { createFleetDatabase, db } from '../../utilis/Firebase';
import { collection, getDocs } from 'firebase/firestore';


function Fleetform() {
  const [newCustomer, setNewCustomer] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [customers, setCustomers] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [priority, setPriority] = useState('low')
  const [customerFleet, setCustomerFleet] = useState([]);
  const [currentUnitIndex, setCurrentUnitIndex] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showCustomerCategory, setShowCustomerForCategory] = useState(null);
  const [FleetsFromFirestore, setFleetsFromFirestore] = useState([]);

  const handleNewCustomerChange = (e) => {
    setNewCustomer(e.target.value);
  };

  const handleCreateNewCustomer = () => {
    if (newCustomer.trim() !== '') {
      setSelectedCustomer(newCustomer); 
      setCustomers([...customers, newCustomer]);
      setNewCustomer('');
    }

  };  
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  }

  const handleAddingUnitNumber = () => {
    if (inputValue.trim() !== '') {
      const newUnit = { UnitNumber: inputValue, customer: selectedCustomer, TaskSpecifics: [], priority };
      setCustomerFleet([...customerFleet, newUnit].sort((a, b) => {
        const priorityOrder = { low: 3, medium: 2, high: 1 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }));
      setInputValue('');
    }
  };

  const handleDeleteUnitNumber = (index) => {
    const updatedUnitInfo = customerFleet.filter((_, i) => i !== index);
    setCustomerFleet(updatedUnitInfo);
  };


  const handleAddUnitInfo = ({ position, specifics, treadDepth }) => {
    if (position.trim() !== '' || specifics.trim() !== '' || treadDepth.trim() !== '') {
      const updatedUnitInfo = [...customerFleet];
      const details = {
        position: position.trim(),
        specifics: specifics.trim(), 
        treadDepth: treadDepth.trim(),
      };
      updatedUnitInfo[currentUnitIndex].TaskSpecifics.push(details);
      setCustomerFleet(updatedUnitInfo);
    }
    setShowPopup(false);
  };


  const submitFleet = () => {
    if (customerFleet.length > 0) {
      createFleetDatabase('fleets', customerFleet);
       setCustomerFleet([]);
       setSelectedCustomer('')
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'fleets'));
        const fetchedFleet = [];
        querySnapshot.forEach((doc) => {
          fetchedFleet.push({ id: doc.id, ...doc.data() });
        });
        setFleetsFromFirestore(fetchedFleet);
      } catch (error) {
        console.error('Error fetching documents: ', error);
      }
    };

    fetchData();
  }, []);

  const ByCustomer = {};
  FleetsFromFirestore.forEach((unit) => {
    if (!ByCustomer[unit.customer]) {
      ByCustomer[unit.customer] = [];
    }
    ByCustomer[unit.customer].push(unit);
  });

  const getCustomerProgress = (cust) => {
    const totalTodos = ByCustomer[cust]?.length || 0;
    const completedTodos = ByCustomer[cust]?.filter((unit) => unit.done).length || 0;

    return totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;
  };

  const toggleCustomerForCategory = (cust) => {
    if (showCustomerCategory === cust) {
      setShowCustomerForCategory(null);
    } else {
      setShowCustomerForCategory(cust);
    }
  };

  const getCustomerFleetCount = (cust) => {
    return ByCustomer[cust]?.length || 0;
  };

  const getCustomerCompletedCount = (cust) => {
    return ByCustomer[cust]?.filter((unit) => unit.done).length || 0;
  };

  const UnitImages = ({ imageUrls }) => {
    return ( 
      <div className="unit-images">
        {imageUrls && imageUrls.map((imageUrl, index) => (
          <img key={index} src={imageUrl} alt={`Image ${index + 1}`} className='unit-image'/>
        ))}
      </div>
    );
  };



  

  return (
    <div>
      {/* <div className='current user'>
        <p className='username'>Welcome,</p> */}
        {/* <button>Log out</button> */}
      {/* </div>
      <h1 className='title'>FleetPro</h1>

      <div className='customer-creation'>
        <input
        type='text'
        value={newCustomer}
        onChange={handleNewCustomerChange}
        placeholder='Enter Customer Name'
        />
        <button onClick={handleCreateNewCustomer}>Start</button>
      </div> */}


      <h2 className='customer'>PLM/Starbucks</h2>
      <div className='input-section'>
        <input
        type='text'
        value={inputValue}
        onChange={handleInputChange}
        placeholder='unit number'
        className='unit-input'
        />
        <select onChange={(e) => setPriority(e.target.value)} value={priority}>
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>
        <button onClick={handleAddingUnitNumber} className='add-button'>Add</button>
      </div>


      <ul className="unit-list">
       
       {customerFleet.map((unit, index) => {
         if (selectedCustomer === 'All' || unit.customer === selectedCustomer) {
           return (
             <li key={index} className={`unit-card priority-${unit.priority}`}>
               <strong>Unit Number:</strong>{unit.UnitNumber}
               <button
                 onClick={() => {
                   setCurrentUnitIndex(index);
                   setShowPopup(true);
                 }}
               >
                 Add Specifics
               </button>
               <ul>
               
                 {unit.TaskSpecifics.map((details, subIndex) => (
                   <li key={subIndex}>
                     <strong>Position:</strong> {details.position}, <strong>Specifics:</strong> {details.specifics}, <strong>Tread Depth:</strong> {details.treadDepth}/32
                   </li>
                 ))}
               </ul>
               <button onClick={() => handleDeleteUnitNumber(index)}>Delete</button>
             </li>
             
           );
           
         }
         return null;
       })}
     </ul>

     {showPopup && (
        <>
          <div className="overlay" onClick={() => setShowPopup(false)} />
          <div className="specifics-popup">
            <FleetSpecifics onClose={() => setShowPopup(false)} onSave={handleAddUnitInfo} />
          </div>
        </>
      )}
      <button className='submission-button' onClick={submitFleet}>submit</button>


      <h1>See how you're other fleets are doing!</h1>

<div className="category-cards">
{Object.keys(ByCustomer).map((Fleetcustomer) => (
  <div key={Fleetcustomer} className="category-card">
    <div
      onClick={() => toggleCustomerForCategory(Fleetcustomer)}
      className={`category-header ${showCustomerCategory === Fleetcustomer ? 'active' : ''}`}
    >
      <h3>{Fleetcustomer} - {getCustomerCompletedCount(Fleetcustomer)}/{getCustomerFleetCount(Fleetcustomer)} Units</h3>
      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{ width: `${getCustomerProgress(Fleetcustomer)}%` }}
        ></div>
      </div>
      <p>{getCustomerProgress(Fleetcustomer).toFixed(2)}% Complete</p>
    </div>
    {showCustomerCategory === Fleetcustomer && (
      <ul className="fleet-list">
        {ByCustomer[Fleetcustomer]
        .sort((unitA, unitB) => {
        const priorityOrder = { low: 3, medium: 2, high: 1 };
        return priorityOrder[unitA.priority] - priorityOrder[unitB.priority];
        }).map((unit) => (
          <li key={unit.id} className={`unit-card priority-${unit.priority} ${unit.done ? 'done' : ''}`}>                   
            <strong>Unit Number:</strong> {unit.UnitNumber} <strong>Priority:</strong>{unit.priority}
            <ul>
              {unit.TaskSpecifics &&
                unit.TaskSpecifics.length > 0 &&
                unit.TaskSpecifics.map((info, index) => (
                  <li key={index}>
                    <strong>Position:</strong> {info.position}, <strong>Specifics:</strong>{' '}
                    {info.specifics}, <strong>Tread Depth:</strong> {info.treadDepth}/32
                  </li>
                ))}
            </ul>
            <UnitImages  imageUrls={unit.imageUrls}  />
          </li>
        ))}
      </ul>
    )}
  </div>
))}
</div>

      
    </div>
  )
}

export default Fleetform