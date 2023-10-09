import './App.css';
import SearchSection from "./Components/SearchSection";
import AddSection from "./Components/AddSection";
import ListSection from "./Components/ListSection";
import {useEffect, useState} from "react";
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
function App() {

    //Initialize firebase data
    const firebaseConfig = {
        apiKey: "AIzaSyCEFgTnf99DsMAPn2An__1bE6xshjBm7zU",
        authDomain: "wproject2-56af9.firebaseapp.com",
        projectId: "wproject2-56af9",
        storageBucket: "wproject2-56af9.appspot.com",
        messagingSenderId: "824962873593",
        appId: "1:824962873593:web:fe16b34d1684a532408a28",
    };

    const app = firebase.initializeApp(firebaseConfig)
    const firestore = app.firestore();

    //Sort list by either id or name
    const sortBy = (type) => {
        if(type === "id") {
            setItemArray([...itemArray].sort((item1, item2) => (item1.id > item2.id) ? 1 : (item1.id < item2.id) ? -1 : 0))
        }
        else if (type === "name") {
            setItemArray([...itemArray].sort((item1, item2) => (item1.name > item2.name) ? 1 : (item1.name < item2.name) ? -1 : 0))
        }
    }

    //Add item in DB and on screen list
    const addItem = (newItem) => {
        firestore.collection("Items").add(newItem).then(() => console.log(newItem, 'was added'))
        setItemArray(previousState => [...previousState, newItem])
    }

    //Remove item in DB and on screen list
    const removeItem = (itemRemoved) => {
        let fbId
        firestore.collection("Items").get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                if(doc.data().id === itemRemoved.id) {
                    fbId = doc.id;
                    firestore.collection("Items").doc(fbId).delete().then(() => console.log('Item with id ' + itemRemoved.id + ' was successfully deleted'))
                }
            })})
        setItemArray(itemArray.filter(item => {return itemRemoved.id !== item.id}))
    }


    const updateItem = (id, newName, newDescription) => {
        console.log(id, newName, newDescription)
        let fbId
        firestore.collection("Items").get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                if(doc.data().id === id) {
                    fbId = doc.id;
                    firestore.collection("Items").doc(fbId).update({
                        name: newName,
                        description: newDescription
                    }).then(() => console.log('Item with id ' + id + ' was successfully updated'))
                }
            })})
        setItemArray(itemArray.map(item => {
            if(id === item.id){
                item.name = newName;
                item.description = newDescription;
            }
            return item}))
    }

    //Return queried item at the top of the list
    const searchItem = (query) => {
        let itemIndex = undefined
        for(var i=0; i < itemArray.length; i++) {
            if (itemArray[i].id === query) {
                itemIndex = i;
                break;
            } else if (itemArray[i].name.toLowerCase() === query.toLowerCase() || (itemArray[i].name.toLowerCase()).includes(query.toLowerCase())) {
                itemIndex = i;
                break;
            }
        }
        //filter out correct item and then append it to the front
        if(itemIndex !== undefined) {
            let correctItem = itemArray[itemIndex]
            let newArr = itemArray.filter(item => {return correctItem.id !== item.id})
            setItemArray(newArr)
            setItemArray(previousState => [correctItem, ...previousState])
        }
    }

    //Fetch DB data on render
    useEffect (() => {
        firestore.collection("Items").get().then((querySnapshot) => {
            const initData = [];
            querySnapshot.forEach((doc) => {
                initData.push(doc.data())
            });
            setItemArray(initData)
        });
    }, [])

    //Store the array of items in the state
    const [itemArray, setItemArray] = useState([]);

  return (
      <div className="container">
        <div  id="main_container">
            <div>
                <div className="inline">
                    <SearchSection onSearch={searchItem} onSortArray={sortBy}></SearchSection>
                    <AddSection array={itemArray} onItemAdded={addItem}></AddSection>
                </div>
                <div>
                    <ListSection array={itemArray} onItemRemoved={removeItem} onItemUpdated={updateItem}> </ListSection>
                </div>
            </div>
        </div>
      </div>
  );
}

export default App;
