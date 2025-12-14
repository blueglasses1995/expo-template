import { Ionicons } from '@expo/vector-icons'
import * as Clipboard from 'expo-clipboard'
import * as DocumentPicker from 'expo-document-picker'
import { File, Paths } from 'expo-file-system'
import { type ExpoWebGLRenderingContext, GLView } from 'expo-gl'
import { useEffect, useState } from 'react'
import { Platform, ScrollView } from 'react-native'
import {
  Button,
  Input,
  Paragraph,
  Separator,
  SizableText,
  Text,
  XStack,
  YStack,
} from 'tamagui'

export default function Toolkit2Tab() {
  // Clipboard state
  const [clipboardInput, setClipboardInput] = useState<string>('Hello Clipboard!')
  const [clipboardContent, setClipboardContent] = useState<string>('')
  const [copyStatus, setCopyStatus] = useState<string>('')

  // Document Picker state
  const [pickedDocument, setPickedDocument] = useState<string>('No document selected')
  const [documentDetails, setDocumentDetails] = useState<string>('')

  // File System state
  const [fsInfo, setFsInfo] = useState<string>('Not loaded')
  const [cacheFiles, setCacheFiles] = useState<string[]>([])

  // GL state
  const [glStatus, setGlStatus] = useState<string>('Not initialized')

  // Clipboard functions
  const copyToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(clipboardInput)
      setCopyStatus('✓ Copied!')
      setTimeout(() => setCopyStatus(''), 2000)
    } catch (error) {
      setCopyStatus(`Error: ${String(error)}`)
    }
  }

  const pasteFromClipboard = async () => {
    try {
      const text = await Clipboard.getStringAsync()
      setClipboardContent(text || '(empty)')
    } catch (error) {
      setClipboardContent(`Error: ${String(error)}`)
    }
  }

  const checkClipboard = async () => {
    try {
      const hasString = await Clipboard.hasStringAsync()
      setClipboardContent(hasString ? 'Has text content' : 'No text content')
    } catch (error) {
      setClipboardContent(`Error: ${String(error)}`)
    }
  }

  // Document Picker functions
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      })

      if (result.canceled) {
        setPickedDocument('Cancelled')
        setDocumentDetails('')
        return
      }

      const asset = result.assets[0]
      setPickedDocument(asset.name)
      const size = asset.size ? `${Math.round(asset.size / 1024)} KB` : 'unknown'
      setDocumentDetails(
        `Type: ${asset.mimeType || 'unknown'}\nSize: ${size}\nURI: ${asset.uri.slice(0, 50)}...`
      )
    } catch (error) {
      setPickedDocument(`Error: ${String(error)}`)
      setDocumentDetails('')
    }
  }

  const pickImage = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      })

      if (result.canceled) {
        setPickedDocument('Cancelled')
        setDocumentDetails('')
        return
      }

      const asset = result.assets[0]
      setPickedDocument(`📷 ${asset.name}`)
      const size = asset.size ? `${Math.round(asset.size / 1024)} KB` : 'unknown'
      setDocumentDetails(`Type: ${asset.mimeType || 'unknown'}\nSize: ${size}`)
    } catch (error) {
      setPickedDocument(`Error: ${String(error)}`)
      setDocumentDetails('')
    }
  }

  // File System functions
  const loadFileSystemInfo = () => {
    try {
      const docDir = Paths.document
      const cacheDir = Paths.cache

      let infoText = `Document Directory:\n${docDir.uri}\n\nCache Directory:\n${cacheDir.uri}`

      // Get free disk space (if available)
      if (Platform.OS !== 'web') {
        try {
          const freeSpace = Paths.availableDiskSpace
          const totalSpace = Paths.totalDiskSpace
          infoText += `\n\nFree Space: ${Math.round(freeSpace / 1024 / 1024 / 1024)} GB`
          infoText += `\nTotal Space: ${Math.round(totalSpace / 1024 / 1024 / 1024)} GB`
        } catch {
          // Some platforms don't support this
        }
      }

      setFsInfo(infoText)

      // List cache directory files
      try {
        const items = cacheDir.list()
        const fileNames = items.slice(0, 5).map((item) => item.name)
        setCacheFiles(fileNames)
      } catch {
        setCacheFiles(['(unable to read)'])
      }
    } catch (error) {
      setFsInfo(`Error: ${String(error)}`)
    }
  }

  const createTestFile = () => {
    try {
      const docDir = Paths.document

      const testFile = new File(docDir, `test-file-${Date.now()}.txt`)
      const content = `Hello from expo-file-system!\nCreated at: ${new Date().toISOString()}`

      testFile.write(content)

      // Read it back
      const readContent = testFile.text()

      // Get file size
      const fileSize = testFile.size

      setFsInfo(
        `✓ Created and read test file:\n${testFile.uri}\n\nContent:\n${readContent}\n\nSize: ${fileSize ?? 0} bytes`
      )
    } catch (error) {
      setFsInfo(`Error: ${String(error)}`)
    }
  }

  // GL render function
  const onContextCreate = (gl: ExpoWebGLRenderingContext) => {
    setGlStatus('GL Context created!')

    // Simple animation - rotating colors
    let frame = 0
    const render = () => {
      frame++
      const r = Math.sin(frame * 0.01) * 0.5 + 0.5
      const g = Math.sin(frame * 0.01 + 2) * 0.5 + 0.5
      const b = Math.sin(frame * 0.01 + 4) * 0.5 + 0.5

      gl.clearColor(r, g, b, 1)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.endFrameEXP()

      requestAnimationFrame(render)
    }
    render()
  }

  useEffect(() => {
    loadFileSystemInfo()
  }, [])

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#000' }}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingVertical: 20,
        gap: 18,
        alignItems: 'center',
        paddingBottom: 120,
      }}
    >
      <YStack ai="center" gap="$2">
        <Ionicons name="folder-open-outline" size={28} color="#F472B6" />
        <SizableText size="$6" color="$color">
          Toolkit 2 (File APIs)
        </SizableText>
        <Paragraph ta="center" color="$gray11">
          Clipboard, Document Picker, File System, GL
        </Paragraph>
      </YStack>

      {/* Clipboard Section */}
      <YStack gap="$2" w="100%" maw={420}>
        <XStack jc="space-between" ai="center">
          <Text fontSize={18} color="$color">
            📋 Clipboard
          </Text>
        </XStack>
        <Input
          value={clipboardInput}
          onChangeText={setClipboardInput}
          placeholder="Text to copy"
        />
        <XStack gap="$2">
          <Button flex={1} onPress={copyToClipboard}>
            Copy
          </Button>
          <Button flex={1} onPress={pasteFromClipboard} variant="outlined">
            Paste
          </Button>
          <Button flex={1} onPress={checkClipboard} variant="outlined">
            Check
          </Button>
        </XStack>
        {copyStatus ? <Text color="$green10">{copyStatus}</Text> : null}
        <Paragraph color="$gray11">
          Clipboard: {clipboardContent || '(not checked)'}
        </Paragraph>
      </YStack>

      <Separator />

      {/* Document Picker Section */}
      <YStack gap="$2" w="100%" maw={420}>
        <XStack jc="space-between" ai="center">
          <Text fontSize={18} color="$color">
            📁 Document Picker
          </Text>
        </XStack>
        <XStack gap="$2">
          <Button flex={1} onPress={pickDocument}>
            Pick Any
          </Button>
          <Button flex={1} onPress={pickImage} variant="outlined">
            Pick Image
          </Button>
        </XStack>
        <Paragraph color="$gray11">Selected: {pickedDocument}</Paragraph>
        {documentDetails ? (
          <Paragraph color="$gray10" fontSize="$2">
            {documentDetails}
          </Paragraph>
        ) : null}
      </YStack>

      <Separator />

      {/* File System Section */}
      <YStack gap="$2" w="100%" maw={420}>
        <XStack jc="space-between" ai="center">
          <Text fontSize={18} color="$color">
            💾 File System
          </Text>
        </XStack>
        <XStack gap="$2">
          <Button flex={1} onPress={loadFileSystemInfo}>
            Refresh Info
          </Button>
          <Button flex={1} onPress={createTestFile} variant="outlined">
            Create File
          </Button>
        </XStack>
        <YStack bg="$gray3" p="$2" br="$2">
          <Paragraph color="$gray11" fontSize="$2" selectable>
            {fsInfo}
          </Paragraph>
        </YStack>
        {cacheFiles.length > 0 && (
          <YStack gap="$1">
            <Text color="$gray10" fontSize="$2">
              Cache files (first 5):
            </Text>
            {cacheFiles.map((file, i) => (
              <Text key={`${file}-${i}`} color="$gray11" fontSize="$1">
                • {file}
              </Text>
            ))}
          </YStack>
        )}
      </YStack>

      <Separator />

      {/* GL Section */}
      <YStack gap="$2" w="100%" maw={420}>
        <XStack jc="space-between" ai="center">
          <Text fontSize={18} color="$color">
            🎨 expo-gl (WebGL)
          </Text>
        </XStack>
        <Paragraph color="$gray11">Status: {glStatus}</Paragraph>
        <YStack h={200} w="100%" br="$4" overflow="hidden">
          <GLView style={{ flex: 1 }} onContextCreate={onContextCreate} />
        </YStack>
        <Paragraph color="$gray10" fontSize="$2">
          Simple color animation using WebGL clear color
        </Paragraph>
      </YStack>

      <Separator />

      {/* Notes Section */}
      <YStack gap="$2" w="100%" maw={420}>
        <Text fontSize={18} color="$color">
          📝 Notes
        </Text>
        <YStack bg="$gray3" p="$3" br="$4" gap="$2">
          <Text color="$gray11" fontSize="$2">
            • <Text fontWeight="bold">expo-dev-client</Text>: Development build tool -
            enables native debugging
          </Text>
          <Text color="$gray11" fontSize="$2">
            • <Text fontWeight="bold">@expo/fingerprint</Text>: Build-time fingerprinting
            - used by EAS for cache optimization
          </Text>
          <Text color="$gray11" fontSize="$2">
            • <Text fontWeight="bold">expo-glass-effect</Text>: iOS 26+ only - Glass
            material effect for premium UI
          </Text>
        </YStack>
      </YStack>
    </ScrollView>
  )
}
