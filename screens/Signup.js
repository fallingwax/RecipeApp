/* 
    David McFarland
    ITN263-4W1
    December 2, 2020
    Final Project - Recipe App
    v 1.1

   Using Data provided by TheMealDB API:  https://www.themealdb.com/api.php
*/
import React, { Component } from 'react';
import {
	StyleSheet, Text, TextInput, View, TouchableOpacity, Dimensions
} from 'react-native';
import firebaseSDK from '../config/firebaseSDK';

// Get the current screens width and height and for styles
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export default class Signup extends Component {
	state = {
		name: null,
		email: null,
		password: null,
	};

    // pass user information to firebase
	onPressCreate = async () => {
		try {
			const user = {
				email: this.state.email,
				password: this.state.password
			};
            await firebaseSDK.createAccount(user);
            
            this.props.navigation.goBack()
		} catch ({ message }) {
			console.log('create account failed. catch error:' + message);
		}
	};

    // change information if desired. 
	onChangeTextEmail = email => this.setState({ email });
	onChangeTextPassword = password => this.setState({ password });
	onChangeTextName = name => this.setState({ name });


	render() {
		return (
			<View style={styles.container}>
                <View style={styles.formField}>
                <TextInput
                        style={styles.textInput}
                        onChangeText={this.onChangeTextEmail}
                        value={this.state.email}
                        placeholder="Email Address"
                        autoCapitalize= 'none'
                    />
                </View>
                <View style={styles.formField}>
                    <TextInput
                        style={styles.textInput}
                        onChangeText={this.onChangeTextPassword}
                        value={this.state.password}
                        placeholder="Password"
                        secureTextEntry
                    />
                </View>
                <TouchableOpacity
                    style={styles.button}
                    onPress={this.onPressCreate}
                >
                    <Text style={styles.buttonText}>Sign Up</Text>
                </TouchableOpacity>

			</View>
		);
	}
}

const offset = 16;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center'
      },
	title: {
		marginTop: offset,
		marginLeft: offset,
		fontSize: offset
	},
    textInput: {
        backgroundColor: '#fff',
        width: windowWidth - 60,
        borderRadius: 5,
        height: 40,
    },
    formField: {
        borderBottomWidth: 1,
        borderColor: 'black',
        margin: 15,
    },
    button: {
        marginTop: 10,
        backgroundColor: '#5cb85c',
        borderRadius: 25,
        borderColor: '#4cae4c',
        borderWidth: 1,
        height: 50,
        width: 200,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
    },
	buttonWrapper: {
		width: 200,
		margin: 5,
		alignSelf: 'center',
	}
});