import * as React from 'react';
import { Text, View, StyleSheet,Image } from 'react-native';
import Search from './screens/search'
import Transaction from './screens/transaction'
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

class BottomTabNavigator extends React.Component{
  render(){
    return(
      <NavigationContainer>
      <Tab.Navigator
      screenOptions={ ({route})=> { return(

        {
          tabBarIcon: ()=>{
               if(route.name === 'Transaction'){
                 return(
                   <Image  style={{width:50,height:50}} source={require('./assets/book.png')}/>
                 )
               }

               else {
                 return(
                   <Image  style={{width:50,height:50}} source={require('./assets/searchingbook.png')}/>
                 )
               }
          }
        }
      )}}


       tabBarOptions={{
        activeTintColor:'blue',
        inactiveTintColor:'gray',
        style:{backgroundColor:'beige',borderRadius:20},
        labelStyle:{fontSize:12}
      }}>
        <Tab.Screen name="Transaction" component={Transaction} />
        <Tab.Screen name="Search" component={Search} />
      </Tab.Navigator>
    </NavigationContainer>
    )
  }
}

export default class App extends React.Component{
  render(){
    return(
      <BottomTabNavigator />
    )
  }
}
