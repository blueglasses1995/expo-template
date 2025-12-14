import { Stack } from 'expo-router'

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#000',
        },
        headerTintColor: '#fff',
        contentStyle: {
          backgroundColor: '#000',
        },
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          title: 'ログイン',
        }}
      />
      <Stack.Screen
        name="verify"
        options={{
          title: '認証コード確認',
        }}
      />
      <Stack.Screen
        name="callback"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  )
}
