/* 
    David McFarland
    ITN263-4W1
    December 2, 2020
    Final Project - Recipe App
    v 1.1

   Using Data provided by TheMealDB API:  https://www.themealdb.com/api.php
*/
import React from 'react';
import { StyleSheet, } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Foundation } from '@expo/vector-icons';
import RecipeView from './screens/RecipeView';
import FavoritesView from './screens/FavoritesView'
import AccountView from './screens/Account'

const Tab = createBottomTabNavigator();

//Function MyTabs, creates the tabs layout for the Bottom Tab Navigator. Using MaterialCommunityIcons for icons. 

function MyTabs() {
   return (
     <Tab.Navigator
       initialRouteName="Recipes"
       tabBarOptions={{
         activeTintColor: '#379eff'
       }}
     >
       <Tab.Screen 
         name="Recipes"
         component={RecipeView}
         options={{
           tabBarLabel: 'Recipes',
           tabBarIcon: ({color, size}) => (
             <MaterialCommunityIcons name="home" color={color} size={size} />
           ),
         }} 
       />
       <Tab.Screen 
         name="Favorites"
         component={FavoritesView}
         options={{
           tabBarLabel: 'Favorites',
           tabBarIcon: ({color, size}) => (
             <MaterialCommunityIcons name="heart-outline" color={color} size={size} />
           ),
         }}
       />
       <Tab.Screen
         name="Settings"
         component={AccountView}
         options={{
           tabBarLabel: 'Account',
           tabBarIcon: ({color, size}) => (
             <Foundation name="torso" size={size} color={color} />
           ),
         }}
       />
     </Tab.Navigator>
   );
 }


export default function App() {

    return (
      <NavigationContainer>
        <MyTabs />
      </NavigationContainer>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
