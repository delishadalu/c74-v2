import * as React from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Image,
  TextInput,
  ToastAndroid,
} from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import db from '../config';
import firebase from 'firebase';

export default class Transaction extends React.Component {
  constructor() {
    super();
    this.state = {
      hasCameraPermission: false,
      scannedData: 'data not scanned',
      buttonState: 'normal',
      studentId: '',
      bookId: '',
    };
  }

  getCamerapermission = async (id) => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    console.log(status);

    this.setState({
      hasCameraPermission: status === 'granted',
      buttonState: id,
    });
  };

  handleBarCodeScanner = ({ data }) => {
    if (this.state.buttonState === 'studentId') {
      this.setState({
        studentId: data,
        buttonState: 'normal',
      });
    } else {
      this.setState({
        bookId: data,
        buttonState: 'normal',
      });
    }
  };
  bookIssued = async () => {
    db.collection('transactions').add({
      studentId: this.state.studentId,
      bookId: this.state.bookId,
      transactionType: 'issued',
      date: firebase.firestore.Timestamp.now().toDate(),
      bookName: this.state.bookName,
      studentName: this.state.studentName,
    });

    db.collection('students')
      .doc(this.state.studentId)
      .update({
        noOfBooksIssued: firebase.firestore.FieldValue.increment(1),
      });

    db.collection('books').doc(this.state.bookId).update({
      bookAvail: false,
    });
    alert('book issued to student');
    //ToastAndroid.show('book issued',ToastAndroid.SHORT)
  };

  bookReturned = async () => {
    db.collection('transactions').add({
      studentId: this.state.studentId,
      bookId: this.state.bookId,
      transactionType: 'issued',
      date: firebase.firestore.Timestamp.now().toDate(),
      bookName: this.state.bookName,
      studentName: this.state.studentName,
    });

    db.collection('students')
      .doc(this.state.studentId)
      .update({
        noOfBooksIssued: firebase.firestore.FieldValue.increment(-1),
      });

    db.collection('books').doc(this.state.bookId).update({
      bookAvail: true,
    });
    alert('book returned back to library');
    //ToastAndroid.show('book issued',ToastAndroid.SHORT)
  };

  getBookName = async () => {
    await db
      .collection('books')
      .where('bookId', '==', this.state.bookId)
      .get()
      .then((resp) => {
        resp.docs.map((memb) =>
          this.setState({ bookName: memb.data().bookName })
        );
      });
  };

  getStudentName = async () => {
    await db
      .collection('students')
      .where('studentId', '==', this.state.studentId)
      .get()
      .then((resp) => {
        resp.docs.map((memb) =>
          this.setState({ studentName: memb.data().studentName })
        );
      });
  };

  bookEligibility = async () => {
    var returnData = '';
    await db
      .collection('books')
      .where('bookId', '==', this.state.bookId)
      .get()
      .then((resp) => {
        if (resp.docs.length === 0) {
          returnData = false;
        } else {
          resp.docs.map((memb) =>
            memb.data().bookAvail
              ? (returnData = 'issued')
              : (returnData = 'returned')
          );
        }
        console.log(returnData);
      });
    return returnData;
  };

  studentEligibleBookIssue = async () => {
    var returnData = '';
    await db
      .collection('students')
      .where('studentId', '==', this.state.studentId)
      .get()
      .then((resp) => {
        if (resp.docs.length === 0) {
          alert('student doesnt belong to this schgool');
          returnData = false;
        } else {
          resp.docs.map((memb) =>
            memb.data().noOfBooksIssued < 2
              ? (returnData = true)
              : ((returnData = false), alert('more than 2 books issued'))
          );
        }
      });
    return returnData;
  };

  studentEligibleBookReturn = async () => {
    var returnData = '';
    await db
      .collection('transactions')
      .where('studentId', '==', this.state.studentId)
      .get()
      .then((resp) => {
        if (resp.docs.length === 0) {
          alert('student doesnt belong to this schgool');
          returnData = false;
        } else {
          resp.docs.map((memb) =>
            memb.data().bookId === this.state.bookId
              ? (returnData = true)
              : ((returnData = false),
                alert('book taken by another student'))
          );
        }
      });
    return returnData;
  };
  handleTransaction = async () => {
    this.getStudentName();
    this.getBookName();

    var bookEligible = await this.bookEligibility();

    if (!bookEligible) {
      alert('book doesnt exist in the library');
    } else if (bookEligible === 'issued') {
      var studentElig = await this.studentEligibleBookIssue();

      if (studentElig) {
        this.bookIssued();
      }
    } else {
      var studentEligb = await this.studentEligibleBookReturn();

      if (studentEligb) {
        this.bookReturned();
      }
    }
   

    this.setState({
      bookId: '',
      studentId: '',
    });
  };

  render() {
    if (
      this.state.buttonState !== 'normal' &&
      this.state.hasCameraPermission === true
    ) {
      return (
        <BarCodeScanner
          style={StyleSheet.absoluteFillObject}
          onBarCodeScanned={this.handleBarCodeScanner}
        />
      );
    }

    return (
      <ImageBackground
        style={{ flex: 1 }}
        source={{
          uri: 'https://mir-s3-cdn-cf.behance.net/project_modules/disp/dc3b2546601081.585ad762e70eb.jpg',
        }}>
        <View style={{ flex: 0.6 }}>
          <Image
            style={{
              width: 150,
              height: 150,
              alignSelf: 'center',
              marginTop: 50,
            }}
            source={require('../assets/booklogo.jpg')}
          />
        </View>
        <Text
          style={{
            color: 'white',
            alignSelf: 'center',
            fontSize: 20,
            marginTop: 30,
          }}>
          {' '}
          WILLY APP
        </Text>
        <View
          style={{ flexDirection: 'row', marginTop: 50, alignSelf: 'center' }}>
          <TextInput
            placeholder="studentId"
            placeholderTextColor="white"
            style={{ borderWidth: 4, width: 200 }}
            onChangeText={(data) => this.setState({ studentId: data })}
            value={this.state.studentId}
          />
          <TouchableOpacity
            onPress={() => this.getCamerapermission('studentId')}
            style={{ borderWidth: 4, width: 50, backgroundColor: 'red' }}>
            <Text> scan </Text>
          </TouchableOpacity>
        </View>

        <View
          style={{ flexDirection: 'row', marginTop: 50, alignSelf: 'center' }}>
          <TextInput
            placeholder="bookId"
            placeholderTextColor="white"
            style={{ borderWidth: 4, width: 200 }}
            onChangeText={(data) => this.setState({ bookId: data })}
            value={this.state.bookId}
          />
          <TouchableOpacity
            onPress={() => this.getCamerapermission('bookId')}
            style={{ borderWidth: 4, width: 50, backgroundColor: 'red' }}>
            <Text> scan </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={this.handleTransaction}
          style={{
            borderWidth: 4,
            backgroundColor: 'yellow',
            width: 70,
            alignSelf: 'center',
            marginTop: 50,
          }}>
          <Text> SUBMIT </Text>
        </TouchableOpacity>
      </ImageBackground>
    );
  }
}
