import { useEffect, useRef } from 'react';
import './App.css';
import { open, save } from '@tauri-apps/api/dialog';
import { readTextFile, writeTextFile } from '@tauri-apps/api/fs';
import { Box, Button, Container, Flex, HStack, Heading, Text, useToast } from '@chakra-ui/react';
import useSetState from 'react-use/lib/useSetState';
import Editor from '@monaco-editor/react';

function App() {
  const [text, setText] = useSetState<any>({ path: '', content: '' });
  const toast = useToast();
  const monacoRef = useRef<any>(null);

  const hasTextFile = text.path && text.content;

  const handleReadFile = async () => {
    try {
      const path = await open({ multiple: false });
      console.log({ path });

      if (path && !Array.isArray(path)) {
        const content = await readTextFile(path);
        setText({ path, content });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Cannot open file',
        status: 'error',
      });
    }
  };

  const handleSaveFile = async () => {
    try {
      await writeTextFile(text.path, text.content);
      toast({
        title: 'Saved',
        description: 'File saved',
        status: 'success',
      });
    } catch (error) {
      console.log(error);
      toast({
        title: 'Error',
        description: 'Cannot save file',
        status: 'error',
      });
    }
  };

  const handleSaveFileAs = async () => {
    try {
      const path = await save();
      if (!path) return;

      await writeTextFile(path, text.content);
      setText({ path });
      toast({
        title: 'Saved',
        description: 'File saved',
        status: 'success',
      });
    } catch (error) {
      console.log(error);
      toast({
        title: 'Error',
        description: 'Cannot save file',
        status: 'error',
      });
    }
  };

  const handleSetModel = () => {
    const { monaco, editor } = monacoRef.current || {};
    const { path } = text || {};

    if (monaco && editor && path) {
      try {
        const model = monaco.editor.createModel(
          text.content, // code
          undefined, // language
          monaco.Uri.file(text.path) // uri
        );

        editor.setModel(model);
      } catch (error) {
        // Do nothing
      }
    }
  };

  useEffect(() => {
    handleSetModel();
  }, [monacoRef.current, text.path]);

  return (
    <Container paddingY={'2rem'} maxW='1024px'>
      <Heading size={'xl'} textAlign={'center'}>
        Tauri code editor
      </Heading>
      <Flex mt={6} alignItems={'center'}>
        <Text mr={2}>Select file to edit:</Text>
        <Button onClick={handleReadFile}>Open</Button>
      </Flex>

      {hasTextFile && (
        <Box mt={'6'}>
          <Text as={'p'}>
            Path: <strong>{text.path}</strong>
          </Text>
          <Box mt={4}>
            <Editor
              height={'500px'}
              onMount={(editor, monaco) => {
                monacoRef.current = { monaco, editor };
                handleSetModel();
              }}
              value={text.content}
              onChange={(value) => setText({ content: value })}
            />
            <HStack mt={2} spacing={2} justifyContent={'center'}>
              <Button onClick={handleSaveFile}>Save file</Button>
              <Button onClick={handleSaveFileAs}>Save file as</Button>
            </HStack>
          </Box>
        </Box>
      )}
    </Container>
  );
}

export default App;
