const firebase = require('firebase/app');
require('firebase/firestore');

const firebaseConfig = {
    apiKey: "AIzaSyAv1p-8jHnfqPYdhtsd2XJmvBPtqhR8qKM",
    authDomain: "docs-web-socket.firebaseapp.com",
    projectId: "docs-web-socket",
    storageBucket: "docs-web-socket.appspot.com",
    messagingSenderId: "1035530629551",
    appId: "1:1035530629551:web:350c65a9e8b09c07717f5a",
    measurementId: "G-FNB9EQ5GLJ"
};

const getDocument = async (documentId)=>{
    const docRef = await firestore.collection('documents').doc(documentId);
    const doc = await docRef.get();
    if(doc.exists){
        let data = doc.data().data.d
        return data;
    }else{
        return createDocument(documentId);
    }
    
    
}
const createDocument =  async (documentId)=> {
    data = {
        data : null
    }
    const docRef = firestore.collection('documents').doc(documentId);
    firestore.collection('documents').doc(documentId).set(data)
        .then(res => {
            return firestore.collection('documents').doc(documentId).get();
           
        }).catch(err=>{
            return null;
        })
   
}

const updateDocument = (documentId, dataString)=>{
    const docRef = firestore.collection('documents').doc(documentId);
    docRef.set({
        data : dataString
    })
    .then(()=>{
        console.log("Data Updated for : ",documentId)
    })
    .catch(error =>{
        console.log('error updating data', error.message);
    })
    return docRef;

}
firebase.initializeApp(firebaseConfig);

const firestore = firebase.firestore();

module.exports = {getDocument, createDocument, updateDocument}