
import { useState, useEffect, useRef } from 'react';
import { View, FlatList, StyleSheet, Alert, Modal, TouchableOpacity, Animated, Platform } from 'react-native';
import { Appbar, Button, Card, Title, Text, Avatar, List, Provider as PaperProvider, Menu } from 'react-native-paper';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../../lib/firebase';
import { router } from 'expo-router';
import { User } from 'firebase/auth';
import CarAnimation from '../../../components/CarAnimation';
import AsyncStorage from '@react-native-async-storage/async-storage';

const availableRoutes = [
  { id: '1', from: 'Johannesburg', to: 'Pretoria', price: 580, distance: 58, icon: 'car-arrow-right' },
  { id: '2', from: 'Cape Town', to: 'Stellenbosch', price: 500, distance: 50, icon: 'car-arrow-right' },
  { id: '3', from: 'Durban', to: 'Pietermaritzburg', price: 780, distance: 78, icon: 'car-arrow-right' },
  { id: '4', from: 'Sandton', to: 'Midrand', price: 180, distance: 18, icon: 'car-arrow-right' },
];

const themes = {
    dark: {
        primary: '#E50914',
        background: '#000',
        card: 'rgba(229, 9, 20, 0.1)',
        text: '#fff',
        subtext: '#B3B3B3',
        modal: '#141414'
    },
    light: {
        primary: '#007BFF',
        background: '#f0f2f5',
        card: '#fff',
        text: '#000',
        subtext: '#6c757d',
        modal: '#fff'
    },
    blue: {
        primary: '#00A8E8',
        background: '#00172D',
        card: '#003459',
        text: '#fff',
        subtext: '#99D9F2',
        modal: '#00172D'
    }
};

export default function HomeScreen() {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [selectedRoute, setSelectedRoute] = useState<any | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [aboutModalVisible, setAboutModalVisible] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<any>(null);
  const [newSelectedRoute, setNewSelectedRoute] = useState<any | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [theme, setTheme] = useState(themes.dark);
  const [menuVisible, setMenuVisible] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    const loadTheme = async () => {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme && themes[savedTheme]) {
            setTheme(themes[savedTheme]);
        }
    };
    loadTheme();

    const checkAnimationShown = async () => {
      const hasShown = await AsyncStorage.getItem('animationShown');
      if (!hasShown) {
        setShowAnimation(true);
        await AsyncStorage.setItem('animationShown', 'true');
      }
    };
    checkAnimationShown();

    const checkAboutModalShown = async () => {
        const hasShown = await AsyncStorage.getItem('aboutModalShown');
        if (!hasShown) {
            setAboutModalVisible(true);
            await AsyncStorage.setItem('aboutModalShown', 'true');
        }
    };
    checkAboutModalShown();
  }, []);

  useEffect(() => {
    if (user) {
      Animated.parallel([
          Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: false,
          }),
          Animated.timing(slideAnim, {
              toValue: 0,
              duration: 800,
              useNativeDriver: false,
          }),
      ]).start();

      const bookingsCollection = collection(db, 'users', user.uid, 'bookings');
      const q = query(bookingsCollection, orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBookings(data);
      });
      return () => unsubscribe();
    }
  }, [user, fadeAnim, slideAnim]);

  const handleSignOut = () => {
    auth.signOut();
  };

  const handleBookNow = () => {
    if (selectedRoute) {
      const booking = { route: selectedRoute, createdAt: new Date() };
      setCurrentBooking(booking);
      setModalVisible(true);
    }
  };

  const confirmBooking = async () => {
    if (user && currentBooking) {
        const bookingsCollection = collection(db, 'users', user.uid, 'bookings');
        await addDoc(bookingsCollection, { 
            ...currentBooking,
            createdAt: serverTimestamp()
        });
        setModalVisible(false);
        setCurrentBooking(null);
        setSelectedRoute(null);
        Alert.alert('Booking Confirmed', `Your ride from ${currentBooking.route.from} to ${currentBooking.route.to} is confirmed.`);
    }
  };

  const handleUpdateBooking = async () => {
    if (user && currentBooking && newSelectedRoute) {
      const bookingDocRef = doc(db, 'users', user.uid, 'bookings', currentBooking.id);
      await updateDoc(bookingDocRef, { route: newSelectedRoute });
      setModalVisible(false);
      setCurrentBooking(null);
      setSelectedRoute(null);
      setNewSelectedRoute(null);
      Alert.alert('Booking Updated', 'Your booking has been updated.');
    }
  };

  const handleDeleteBooking = async () => {
    if (user && currentBooking) {
      const bookingDocRef = doc(db, 'users', user.uid, 'bookings', currentBooking.id);
      await deleteDoc(bookingDocRef);
      setModalVisible(false);
      setCurrentBooking(null);
      setSelectedRoute(null);
      setNewSelectedRoute(null);
      Alert.alert('Booking Canceled', 'Your booking has been canceled.');
    }
  };

  const changeTheme = async (themeName) => {
    setTheme(themes[themeName]);
    await AsyncStorage.setItem('theme', themeName);
    setMenuVisible(false);
  };

  const styles = getStyles(theme);

  const renderRoute = ({ item }) => (
    <TouchableOpacity onPress={() => setSelectedRoute(item)}>
        <List.Item
            title={`${item.from} to ${item.to}`}
            description={`ZAR ${item.price} - ${item.distance} km`}
            left={props => <List.Icon {...props} icon={item.icon} color={theme.primary} />}
            style={[styles.card, selectedRoute?.id === item.id && styles.selectedCard]}
            titleStyle={{ color: theme.text }}
            descriptionStyle={{ color: theme.subtext }}
        />
    </TouchableOpacity>
  );

  const renderModalRoute = ({ item }) => (
    <TouchableOpacity onPress={() => setNewSelectedRoute(item)}>
        <List.Item
            title={`${item.from} to ${item.to}`}
            description={`ZAR ${item.price} - ${item.distance} km`}
            left={props => <List.Icon {...props} icon={item.icon} color={theme.primary} />}
            style={[styles.card, newSelectedRoute?.id === item.id && styles.selectedCard]}
            titleStyle={{ color: theme.text }}
            descriptionStyle={{ color: theme.subtext }}
        />
    </TouchableOpacity>
  );

  return (
    <PaperProvider>
      <View style={styles.container}>
        {showAnimation && <CarAnimation />}
        <Appbar.Header style={{backgroundColor: 'transparent'}}>
          <Appbar.Content title="IDBase Rideshare" titleStyle={styles.appbarTitle}/>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={<Appbar.Action icon="palette" color={theme.primary} onPress={() => setMenuVisible(true)} />}>
            <Menu.Item onPress={() => changeTheme('dark')} title="Dark" />
            <Menu.Item onPress={() => changeTheme('light')} title="Light" />
            <Menu.Item onPress={() => changeTheme('blue')} title="Blue" />
          </Menu>
          <Appbar.Action icon="information-outline" color={theme.primary} onPress={() => setAboutModalVisible(true)} />
          <Button color={theme.primary} onPress={handleSignOut}>Sign Out</Button>
        </Appbar.Header>
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Title style={styles.listTitle}>Available Routes</Title>
            <FlatList
                data={availableRoutes}
                renderItem={renderRoute}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingHorizontal: 8 }}
            />
            <Button 
                mode="contained" 
                onPress={handleBookNow} 
                style={styles.button} 
                labelStyle={styles.buttonLabel}
                disabled={!selectedRoute}
            >
                Book Now
            </Button>

            <Title style={styles.listTitle}>My Bookings</Title>
            {bookings.length > 0 ? (
              <FlatList
                  data={bookings}
                  keyExtractor={item => item.id}
                  renderItem={({ item }) => (
                      <List.Item
                        title={`${item.route.from} to ${item.route.to}`}
                        description={`ZAR ${item.route.price} - ${item.route.distance} km`}
                        left={props => <List.Icon {...props} icon={item.route.icon} color={theme.primary} />}
                        right={() => (
                          <Button onPress={() => { setCurrentBooking(item); setModalVisible(true); }} color={theme.primary}>
                            Manage
                          </Button>
                        )}
                        titleStyle={{ color: theme.text }}
                        descriptionStyle={{ color: theme.subtext }}
                      />
                  )}
              />
            ) : (
              <Text style={styles.emptyText}>You have no active bookings.</Text>
            )}
        </Animated.View>
        {aboutModalVisible && (
            <Modal
                animationType="slide"
                transparent={true}
                visible={aboutModalVisible}
                onRequestClose={() => setAboutModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Title style={styles.modalTitle}>About IDBase Rideshare</Title>
                        <Text style={styles.aboutText}>
                            IDBase Rideshare is a revolutionary new platform that connects drivers and passengers with a focus on security and trust. Our innovative identity verification system ensures that all users are who they say they are, creating a safer and more reliable ridesharing experience. Whether you're a driver looking to earn extra income or a passenger in need of a dependable ride, IDBase Rideshare has you covered.
                        </Text>
                        <Button mode="text" onPress={() => setAboutModalVisible(false)} color={theme.subtext}>Close</Button>
                    </View>
                </View>
            </Modal>
        )}
        {currentBooking && (
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                    <Title style={styles.modalTitle}>Manage Your Booking</Title>
                    {currentBooking.id ? (
                      <>
                        <Title style={styles.listTitle}>Select New Route</Title>
                        <FlatList
                            data={availableRoutes}
                            renderItem={renderModalRoute}
                            keyExtractor={item => item.id}
                        />
                        <Button mode="contained" onPress={handleUpdateBooking} style={styles.modalButton} labelStyle={styles.buttonLabel} disabled={!newSelectedRoute}>Update Booking</Button>
                        <Button mode="contained" onPress={handleDeleteBooking} style={[styles.modalButton, {backgroundColor: theme.subtext}]} labelStyle={{color: '#000'}}>Cancel Booking</Button>
                      </>
                    ) : (
                      <Button mode="contained" onPress={confirmBooking} style={styles.modalButton} labelStyle={styles.buttonLabel}>Confirm Booking</Button>
                    )}
                    <Button mode="text" onPress={() => { setModalVisible(false); setCurrentBooking(null); setSelectedRoute(null); setNewSelectedRoute(null); }} color={theme.subtext}>Close</Button>
                    </View>
                </View>
            </Modal>
        )}
      </View>
    </PaperProvider>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  appbarTitle: {
    color: theme.primary,
    fontWeight: 'bold',
    textShadowColor: 'rgba(229, 9, 20, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  content: {
    flex: 1,
    padding: 16,
  },
  aboutText: {
    color: theme.subtext,
    fontSize: 16,
    textAlign: 'justify',
    lineHeight: 24,
    marginBottom: 15
  },
  listTitle: {
      color: theme.primary,
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 10,
      marginLeft: 8,
  },
  card: {
    backgroundColor: theme.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.3)',
    marginBottom: 10,
  },
  selectedCard: {
    borderColor: theme.primary,
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
  },
  button: {
    marginTop: 24,
    backgroundColor: theme.primary,
    borderRadius: 5,
    paddingVertical: 8,
  },
  buttonLabel: {
    color: theme.text,
    fontWeight: 'bold',
  },
  emptyText: {
      color: theme.text,
      textAlign: 'center',
      marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modalContent: {
    backgroundColor: theme.modal,
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
    borderColor: theme.primary,
    borderWidth: 1,
  },
  modalTitle: {
    color: theme.primary,
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 22,
    fontWeight: 'bold',
  },
  modalButton: {
    marginTop: 10,
    backgroundColor: theme.primary,
    borderRadius: 5,
    paddingVertical: 8,
  }
});
