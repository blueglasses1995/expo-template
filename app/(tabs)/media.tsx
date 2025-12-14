import { Ionicons } from '@expo/vector-icons'
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio'
import { useVideoPlayer, VideoView } from 'expo-video'
import { useCallback, useRef, useState } from 'react'
import { ScrollView } from 'react-native'
import PagerView from 'react-native-pager-view'
import { Button, Paragraph, Separator, SizableText, Text, XStack, YStack } from 'tamagui'

// Sample media URLs
const SAMPLE_VIDEO =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
const SAMPLE_AUDIO = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'

export default function MediaTab() {
  // Video player
  const videoPlayer = useVideoPlayer(SAMPLE_VIDEO, (player) => {
    player.loop = false
  })
  const [videoStatus, setVideoStatus] = useState('paused')

  // Audio player
  const audioPlayer = useAudioPlayer(SAMPLE_AUDIO)
  const audioStatus = useAudioPlayerStatus(audioPlayer)

  // Pager View
  const pagerRef = useRef<PagerView>(null)
  const [currentPage, setCurrentPage] = useState(0)

  const toggleVideo = useCallback(() => {
    if (videoPlayer.playing) {
      videoPlayer.pause()
      setVideoStatus('paused')
    } else {
      videoPlayer.play()
      setVideoStatus('playing')
    }
  }, [videoPlayer])

  const toggleAudio = useCallback(() => {
    if (audioStatus.playing) {
      audioPlayer.pause()
    } else {
      audioPlayer.play()
    }
  }, [audioPlayer, audioStatus.playing])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: 'transparent' }}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingVertical: 20,
        gap: 18,
        alignItems: 'center',
        paddingBottom: 120,
      }}
    >
      <YStack ai="center" gap="$2">
        <Ionicons name="play-circle-outline" size={28} color="#A78BFA" />
        <SizableText size="$6" color="$color">
          Media (Video / Audio / Pager)
        </SizableText>
        <Paragraph ta="center" color="$gray11">
          expo-video, expo-audio, react-native-pager-view
        </Paragraph>
      </YStack>

      {/* Video Section */}
      <YStack gap="$2" w="100%" maw={420}>
        <Text fontSize={18} color="$color">
          🎬 Video Player
        </Text>
        <YStack h={220} w="100%" br="$4" overflow="hidden" bg="$gray2">
          <VideoView
            player={videoPlayer}
            style={{ flex: 1 }}
            allowsFullscreen
            allowsPictureInPicture
          />
        </YStack>
        <XStack gap="$2">
          <Button flex={1} onPress={toggleVideo}>
            {videoStatus === 'playing' ? 'Pause' : 'Play'}
          </Button>
          <Button
            flex={1}
            variant="outlined"
            onPress={() => {
              videoPlayer.seekBy(-10)
            }}
          >
            -10s
          </Button>
          <Button
            flex={1}
            variant="outlined"
            onPress={() => {
              videoPlayer.seekBy(10)
            }}
          >
            +10s
          </Button>
        </XStack>
        <Paragraph color="$gray11" fontSize="$2">
          Status: {videoStatus} | Loop: {videoPlayer.loop ? 'on' : 'off'}
        </Paragraph>
      </YStack>

      <Separator />

      {/* Audio Section */}
      <YStack gap="$2" w="100%" maw={420}>
        <Text fontSize={18} color="$color">
          🎵 Audio Player
        </Text>
        <YStack bg="$gray3" p="$3" br="$4" gap="$2">
          <XStack jc="space-between" ai="center">
            <Text color="$gray11">
              {formatTime(audioStatus.currentTime)} /{' '}
              {formatTime(audioStatus.duration || 0)}
            </Text>
            <Text color="$gray10" fontSize="$2">
              {audioStatus.playing ? '▶️ Playing' : '⏸️ Paused'}
            </Text>
          </XStack>
          <YStack h={4} bg="$gray5" br="$2" overflow="hidden">
            <YStack
              h="100%"
              bg="$purple9"
              w={`${((audioStatus.currentTime / (audioStatus.duration || 1)) * 100).toFixed(1)}%`}
            />
          </YStack>
        </YStack>
        <XStack gap="$2">
          <Button flex={1} onPress={toggleAudio}>
            {audioStatus.playing ? 'Pause' : 'Play'}
          </Button>
          <Button
            flex={1}
            variant="outlined"
            onPress={() => {
              audioPlayer.seekTo(0)
            }}
          >
            Restart
          </Button>
        </XStack>
      </YStack>

      <Separator />

      {/* Pager View Section */}
      <YStack gap="$2" w="100%" maw={420}>
        <Text fontSize={18} color="$color">
          📖 Pager View
        </Text>
        <YStack h={200} w="100%" br="$4" overflow="hidden">
          <PagerView
            ref={pagerRef}
            style={{ flex: 1 }}
            initialPage={0}
            onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
          >
            <YStack key="1" flex={1} bg="$red5" ai="center" jc="center">
              <Text fontSize={24} color="$red11">
                Page 1 🔴
              </Text>
              <Text color="$red10">Swipe to navigate</Text>
            </YStack>
            <YStack key="2" flex={1} bg="$green5" ai="center" jc="center">
              <Text fontSize={24} color="$green11">
                Page 2 🟢
              </Text>
              <Text color="$green10">Keep swiping!</Text>
            </YStack>
            <YStack key="3" flex={1} bg="$blue5" ai="center" jc="center">
              <Text fontSize={24} color="$blue11">
                Page 3 🔵
              </Text>
              <Text color="$blue10">Last page</Text>
            </YStack>
          </PagerView>
        </YStack>
        <XStack gap="$2" jc="center">
          {[0, 1, 2].map((i) => (
            <YStack
              key={i}
              w={10}
              h={10}
              br={5}
              bg={currentPage === i ? '$purple9' : '$gray6'}
              pressStyle={{ scale: 0.9 }}
              onPress={() => pagerRef.current?.setPage(i)}
            />
          ))}
        </XStack>
        <Text color="$gray11" ta="center">
          Current: Page {currentPage + 1}
        </Text>
      </YStack>
    </ScrollView>
  )
}
