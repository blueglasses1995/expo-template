import { Atom, AudioWaveform, Folder, Image } from '@tamagui/lucide-icons'
import { Link, Tabs } from 'expo-router'
import { Button, useTheme } from 'tamagui'

export default function TabLayout() {
  const theme = useTheme()

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.red10.val,
        tabBarStyle: {
          backgroundColor: theme.background.val,
          borderTopColor: theme.borderColor.val,
        },
        headerStyle: {
          backgroundColor: theme.background.val,
          borderBottomColor: theme.borderColor.val,
        },
        headerTintColor: theme.color.val,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tab One',
          tabBarIcon: ({ color }: { color: string }) => <Atom color={color} />,
          headerRight: () => (
            <Link href="/modal" asChild>
              <Button mr="$4" size="$2.5">
                Hello!
              </Button>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Tab Two',
          tabBarIcon: ({ color }: { color: string }) => <AudioWaveform color={color} />,
        }}
      />
      <Tabs.Screen
        name="skia"
        options={{
          title: 'Skia',
          tabBarIcon: ({ color }: { color: string }) => <Atom color={color} />,
        }}
      />
      <Tabs.Screen
        name="updates"
        options={{
          title: 'Updates',
          tabBarIcon: ({ color }: { color: string }) => <AudioWaveform color={color} />,
        }}
      />
      <Tabs.Screen
        name="toolkit"
        options={{
          title: 'Toolkit',
          tabBarIcon: ({ color }: { color: string }) => <Atom color={color} />,
        }}
      />
      <Tabs.Screen
        name="toolkit2"
        options={{
          title: 'Toolkit2',
          tabBarIcon: ({ color }: { color: string }) => <Folder color={color} />,
        }}
      />
      <Tabs.Screen
        name="media"
        options={{
          title: 'Media',
          tabBarIcon: ({ color }: { color: string }) => <Image color={color} />,
        }}
      />
      <Tabs.Screen
        name="four"
        options={{
          title: 'Storybook',
          tabBarIcon: ({ color }: { color: string }) => <Atom color={color} />,
        }}
      />
    </Tabs>
  )
}
