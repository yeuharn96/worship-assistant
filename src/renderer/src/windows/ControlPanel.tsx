import { useEffect, useMemo, useState } from 'react';
import { EyeOff, Presentation } from 'lucide-react';
import BibleSelectionPane from '../components/BibleMode/BibleSelectionPane';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import TextSettingPane from '../components/BibleMode/TextSettingPane';
import AdvanceSettingPane from '../components/AdvanceSettingPane';
import useProfileStore from '../store/profile';
import useProfileListStore from '../store/profileList';
import useOutputStore from '../store/output';
import PreviewOutputPane from '@renderer/components/BibleMode/PreviewOutputPane';
import { useIpcListeners } from '@renderer/lib/ipc';
import VideoPlaylist from '@renderer/components/VideoMode/VideoPlaylist';
import PreviewVideoPane from '@renderer/components/VideoMode/PreviewVideoPane';
import { cn } from '@renderer/lib/utils';
import useModalStore from '@renderer/store/modal';
import { toast } from 'sonner';

const ControlPanel = () => {
  const profileState = useProfileStore();
  const { mode, setProfile, getProfile, loadProfile } = profileState;
  const { refresh: refreshProfiles, switchTo: switchProfile } = useProfileListStore();
  const { openGlobalModal } = useModalStore();
  const { book, chapter, verse, isShowing, playingVideo, setOutput } = useOutputStore();
  // Only changes when the profile store changes, so effects below don't re-run on unrelated renders.
  const profile = useMemo(() => getProfile(), [profileState]);

  const [currentTab, setCurrentTab] = useState('bible');
  const [settingTab, setSettingTab] = useState('setting');

  useIpcListeners(
    {
      hideOutput: () => {
        setOutput({ isShowing: false });
        if (mode === 'video') window.api.sendVideoCommand({ pause: true });
      },
      setBookTitleLanguage: (lang) => {
        setProfile({ lang });
      },
      setOutputDimension: (dimension) => setOutput({ dimension }),
      // Only sent while the output is hidden: the main process blocks importing while it's showing.
      loadProfile: (importedProfile) => {
        // The imported profile brings its own copy of its background, so the current one is no longer used.
        // The main process can't remove it if it was picked this session, since it isn't saved until the app closes.
        const { bgImage } = getProfile();
        if (bgImage && bgImage !== importedProfile.bgImage) window.api.removeFromDataFolder(bgImage);

        // loadProfile resets keys the imported profile doesn't have (settings.json leaves out a missing background),
        // so the (now deleted) current background isn't kept.
        loadProfile(importedProfile);
        setCurrentTab(importedProfile.mode);
        refreshProfiles();
      },
      switchProfileRequested: async (id) => {
        const error = await switchProfile(id);
        if (error) toast.error('Unable to switch profile', { description: error, closeButton: true });
      },
      openProfilesManager: () => openGlobalModal({ name: 'profiles' }),
    },
    [mode, isShowing],
  );

  useEffect(() => {
    (async () => {
      const savedProfile = await window.api.getCurrentProfile();
      if (savedProfile) {
        loadProfile(savedProfile);
        setCurrentTab(savedProfile.mode);
      } else {
        // First run: register the default profile so it can be listed, renamed and switched away from.
        await window.api.saveProfile(getProfile());
      }
      refreshProfiles();
    })();
  }, []);

  useEffect(() => {
    if (currentTab !== 'preview') setProfile({ mode: currentTab as 'bible' | 'video' });
  }, [currentTab]);

  // Switching profile can change the mode, so follow it with the Bible/Video tab.
  useEffect(() => {
    if (currentTab === 'preview' || currentTab === mode) return;
    setSettingTab(mode === 'video' ? 'advance' : 'setting');
    setCurrentTab(mode);
  }, [mode]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      window.electron.ipcRenderer.send('window-closing', getProfile());
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (isShowing) window.api.applyOutputSettings(profile);
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
        <div className='pt-0 pb-1 px-4 mb-2'>
          <Button
            variant='border'
            size='block'
            className='text-4xl mt-3 py-[5vh] disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-inherit'
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
