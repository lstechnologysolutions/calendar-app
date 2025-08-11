import React from 'react';
import { SafeAreaView } from 'react-native';
import { Stack } from 'expo-router';
import CalendarComponent from '../src/components/Calendar/CalendarComponent';

const CalendarScreen = () => {
  return (
    <SafeAreaView >
      <Stack.Screen
        options={{
          title: 'Book an Appointment',
        }}
      />
      <CalendarComponent />
    </SafeAreaView>
  );
};

export default CalendarScreen;
