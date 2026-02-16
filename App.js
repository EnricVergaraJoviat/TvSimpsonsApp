import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SeasonsScreen from "./src/screens/SeasonsScreen";
import EpisodesScreen from "./src/screens/EpisodesScreen";
import { RaspberryStatusProvider } from "./src/context/RaspberryStatusContext";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <RaspberryStatusProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Seasons"
            component={SeasonsScreen}
            options={{ headerShown: false }} // 👈 OCULTO
          />
          <Stack.Screen
            name="Episodes"
            component={EpisodesScreen}
            options={{ headerShown: false }} // 👈 OCULTO
          />
        </Stack.Navigator>
      </NavigationContainer>
    </RaspberryStatusProvider>
  );
}
