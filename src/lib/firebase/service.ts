import { collection, addDoc,doc, getDoc, getDocs,getFirestore, query, where } from "firebase/firestore";
import app from "./init";
import bcrypt from 'bcrypt';

const firestore = getFirestore(app);

export async function retriveData(collectionName: string) {
    const snapshot = await getDocs(collection(firestore, collectionName));
    const data = snapshot.docs.map((doc) => ({ 
        id: doc.id , 
        ...doc.data(),
     }));
    return data;
}

export async function retriveDataById(collectionName: string, id: string) {
    const snapshot = await getDoc(doc(firestore, collectionName, id));
    const data = snapshot.data();

    return data;
}

export async function signUp(userData: {
    email: string;
    password: string;   
    fullname: string;
    phone: string;
    role?: string;

}, callback: Function){
    const q = query(collection(firestore, "users"), where("email", "==", userData.email));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(), 
    }))

    if(data.length > 0){
        callback(false)
    }else{
        if(!userData.role) {
            userData.role = "user"
        }
        userData.password = await bcrypt.hash(userData.password, 10)
        await addDoc(collection(firestore, "users"), userData)
        .then(() => {
            callback(true);
        })
        .catch((error) => {
            callback(false);
            console.log(error);
        })
    }
}

export async function signIn(email:string) {
    const q = query(collection(firestore, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(), 
    }));

    if(data){
        return data[0];
    }else {
        return null
    }
}

export async function loginWithGoogle(data: any, callback: Function) {
    const q = query(collection(firestore, "users"), where("email", "==", data.email));
    const querySnapshot = await getDocs(q);
    const user = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(), 
    }));

    if(user.length>0){
        callback(user[0]);
    }else{
        data.role = "user";
        await addDoc(collection(firestore, "users"), data).then(() => {
            callback(data);
        })
    }
}