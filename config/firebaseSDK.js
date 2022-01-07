/* 
    David McFarland
    ITN263-4W1
    December 2, 2020
    Final Project - Recipe App
    v 1.1

   Using Data provided by TheMealDB API:  https://www.themealdb.com/api.php
*/

import firebase from 'firebase';
import { LogBox } from 'react-native';

// set up a wait timer
const wait = (timeout) => {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
}

class FirebaseSDK {
    constructor() {
      if (!firebase.apps.length) {
        //avoid re-initializing
        firebase.initializeApp({
          apiKey: 'AIzaSyBFDqM5DDDdekYk9jwg0xxihN37kWTyDcE',
          authDomain: 'recipeapp-9690d.firebaseapp.com',
          databaseURL: 'https://recipeapp-9690d.firebaseio.com',
          projectId: 'recipeapp-9690d',
          storageBucket: 'recipeapp-9690d.appspot.com',
          messagingSenderId: '1067445801584'
        });

        // used in troubleshooting the setting a timer issue with firebase
        LogBox.ignorePatterns = [
          'Setting a timer'
          ];
      }


  }

  // login function
  login = async (user, success_callback, failed_callback) => {
    await firebase
      .auth()
      .signInWithEmailAndPassword(user.email, user.password)
      .then(success_callback, failed_callback);
    };

  // create a new account 
  createAccount = async user => {
    firebase
      .auth()
      .createUserWithEmailAndPassword(user.email, user.password)
      .then(
        function() {
          console.log(
            'created user successfully. User email:' +
              user.email
          );
          var userf = firebase.auth().currentUser;
          userf.updateProfile({ displayName: user.name }).then(
            function() {
              alert(
                'User ' + user.email + ' was created successfully. Please login.'
              );
            },
            function(error) {
              console.warn('Error update displayName.');
            }
          );
        },
        function(error) {
          console.error('got error:' + typeof error + ' string:' + error.message);
          alert('Create account failed. Error: ' + error.message);
        }
      );
  };

  observeAuth = () =>
  firebase.auth().onAuthStateChanged(this.onAuthStateChanged);

  onAuthStateChanged = user => {
    if (!user) {
      try {
        this.login(user);
      } catch ({ message }) {
        console.log("Failed:" + message);
      }
    } else {
      console.log("Reusing auth...");
    }
  };

  // sign out from friebase authentication
  onLogout = user => {
    firebase.auth().signOut().then(function() {
      console.log("Sign-out successful.");
    }).catch(function(error) {
      console.log("An error happened when signing out");
    });
  }

  /* 
    saveRecipe (user name, recipe title, recipe id).  Reference is the users email address stripped of the period and then
    the id of the recipe for each saved item. 
  */ 
  saveRecipe = async (user, title, id) => {
    wait(2000).then(() =>
    firebase
      .database()
      .ref('/' + user.replace('.','') + '/' + id)
      .set({
        recipeId: id,
        title: title
      }) , []);

    console.log(id)
  }

  /*
    getRecipe takes the user as param and strips it of the period and returns of snapshot of the users data.  
  */
  getRecipe = async (user) => {
    const snapshot = await
    firebase
      .database()
        .ref(user.replace('.',''))
        .once('value')

    return snapshot.val()
  }

  /*
    used to remove a recipe from the favorites list of a user
  */
  deleteRecipe = async (user, id) => {
    let userRef = firebase .database().ref('/' + user.replace('.','') + '/' + id);
    await userRef.remove();
  } 
}

const firebaseSDK = new FirebaseSDK();

export default firebaseSDK;