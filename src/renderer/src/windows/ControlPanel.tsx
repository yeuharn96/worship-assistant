import { useEffect, useState } from 'react';
import { EyeOff, Presentation } from 'lucide-react';
import BibleSelectionPane from '../components/BibleMode/BibleSelectionPane';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import TextSettingPane from '../components/BibleMode/TextSettingPane';
import AdvanceSettingPane from '../components/AdvanceSettingPane';
import useProfileStore from '../store/profile';
import useOutputStore from '../store/output';
import PreviewOutputPane from '@renderer/components/BibleMode/PreviewOutputPane';
import { useIpcListeners } from '@renderer/lib/ipc';
import VideoPlaylist from '@renderer/components/VideoMode/VideoPlaylist';
import PreviewVideoPane from '@renderer/components/VideoMode/PreviewVideoPane';
import { cn } from '@renderer/lib/utils';

const ControlPanel = () => {
  const { mode, setProfile, getProfile } = useProfileStore();
  const { book, chapter, verse, isShowing, playingVideo, setOutput } = useOutputStore();
  const profile = getProfile();

  const [currentTab, setCurrentTab] = useState('bible');
  const [settingTab, setSettingTab] = useState('setting');

  useIpcListeners(
    {
      hideOutput: () => {
        setOutput({ isShowing: false });
        if (mode === 'video') window.api.sendVideoCommand({ pause: true });
      },
    },
    [mode],
  );

  useEffect(() => {
    (async () => {
      const currentProfile = (await window.api.getCurrentProfile()) ?? profile;
      setProfile(currentProfile);
      setCurrentTab(currentProfile.mode);
    })();
  }, []);

  useEffect(() => {
    if (currentTab !== 'preview') setProfile({ mode: currentTab as 'bible' | 'video' });
  }, [currentTab]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      window.electron.ipcRenderer.send('window-closing', profile);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [profile]);

  const hideOutput = () => {
    if (!isShowing) return;
    window.api.hideOutput();
  };

  const showOutput = () => {
    if (!isShowing) setCurrentTab('preview');

    window.api.applyOutputSettings(profile);
    window.api.showOutput();
    window.api.monitorOutput();
    setOutput({ isShowing: true });
    if (currentTab === 'bible') {
      window.api.setOutputBibleText({ book, chapter, verse });
    } else if (currentTab === 'video') {
      playingVideo && window.api.setOutputVideo(playingVideo);
    }
  };

  return (
    <div className='flex'>
      <div className='flex-[8]'>
        <Tabs
          value={currentTab}
          onValueChange={(tab) => {
            setSettingTab(tab === 'video' ? 'advance' : 'setting');
            setCurrentTab(tab);
          }}
          className='mt-[0.05vh] ml-2'
        >
          <TabsList
            className={cn(
              'w-full bg-transparent border-b-2 rounded-none border-gray-400 justify-start p-0 h-[calc(0.05*100vh)]',
              '[&>*]:text-gray-300 [&>*]:bg-[#fff1] [&>*]:h-full [&>*]:rounded-b-none [&>*]:border-b-0',
            )}
          >
            {isShowing && mode === 'video' ? null : (
              <TabsTrigger
                value='bible'
                className='w-1/6 data-[state=inactive]:hover:bg-gray-500 data-[state=inactive]:hover:text-white'
              >
                Bible
              </TabsTrigger>
            )}
            {isShowing && mode === 'bible' ? null : (
              <TabsTrigger
                value='video'
                className='w-1/6 data-[state=inactive]:hover:bg-gray-500 data-[state=inactive]:hover:text-white'
              >
                Video
              </TabsTrigger>
            )}
            <TabsTrigger
              value='preview'
              className='min-w-[calc(100%/6)] ml-auto data-[state=inactive]:hover:bg-gray-500 data-[state=inactive]:hover:text-white'
            >
              Preview
              {isShowing && (
                <>
                  <span className='h-2 w-2 ml-2 mr-1 rounded-full inline-block bg-red-600'></span>
                  <span className='text-red-500'>Now showing</span>
                </>
              )}
            </TabsTrigger>
          </TabsList>
          <TabsContent forceMount hidden={currentTab !== 'bible'} value='bible'>
            <BibleSelectionPane />
          </TabsContent>
          <TabsContent forceMount hidden={currentTab !== 'video'} value='video'>
            <VideoPlaylist />
          </TabsContent>
          <TabsContent forceMount hidden={currentTab !== 'preview'} value='preview'>
            {profile.mode === 'bible' && <PreviewOutputPane show={currentTab === 'preview'} />}
            {profile.mode === 'video' && <PreviewVideoPane />}
          </TabsContent>
        </Tabs>
      </div>
      <div className='flex-[2]'>
        <div className='py-1 px-4 mb-4'>
          <Button
            variant='border'
            size='block'
            className='text-4xl mt-4 py-[5vh] disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-inherit'
            onClick={showOutput}
            title={mode === 'video' && !playingVideo ? 'Please select a video first' : ''}
            disabled={mode === 'video' && !playingVideo}
          >
            <Presentation className='mr-2 h-10 w-10' /> Show
          </Button>
          <Button variant='border' size='block' className='text-4xl mt-4 py-[5vh]' onClick={hideOutput}>
            <EyeOff className='mr-2 h-10 w-10' /> Hide
          </Button>
        </div>
        <div className='px-4'>
          <Tabs value={settingTab} onValueChange={setSettingTab} className='w-full'>
            <TabsList className='w-full bg-transparent border-b-2 rounded-none p-0 border-gray-400 [&>*]:w-full [&>*]:text-gray-300 [&>*[data-state="inactive"]:hover]:bg-gray-700'>
              <TabsTrigger value='setting'>Bible Setting</TabsTrigger>
              <TabsTrigger value='advance'>Advance</TabsTrigger>
            </TabsList>
            <TabsContent value='setting'>
              <TextSettingPane />
            </TabsContent>
            <TabsContent value='advance'>
              <AdvanceSettingPane />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
