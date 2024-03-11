import { RotateCcw, RotateCw } from 'lucide-react';
import InputNumber from './ui/input-number';
import useProfileStore from '@renderer/store/profile';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';

const AdvanceSettingPane = () => {
  const { adjustment, scrollUnit, mode, skipSeconds, loop, playNext, setAdjustment, setProfile } = useProfileStore();

  return (
    <div>
      <div className='flex flex-col border-b-2 border-gray-600 pb-2 mb-2 [&>div]:text-center'>
        <div className='mx-auto w-1/3 text-center'>
          <div>top</div>
          <InputNumber
            value={adjustment.top}
            min={-9999}
            max={9999}
            onChange={(value) => setAdjustment({ top: value })}
          />
        </div>
        <div className='flex'>
          <div className='mr-auto w-1/3 text-center'>
            <div>left</div>
            <InputNumber
              value={adjustment.left}
              min={-9999}
              max={9999}
              onChange={(value) => setAdjustment({ left: value })}
            />
          </div>
          <div className='ml-auto w-1/3 text-center'>
            <div>right</div>
            <InputNumber
              value={adjustment.right}
              min={-9999}
              max={9999}
              onChange={(value) => setAdjustment({ right: value })}
            />
          </div>
        </div>
        <div className='mx-auto w-1/3 text-center'>
          <div>bottom</div>
          <InputNumber
            value={adjustment.bottom}
            min={-9999}
            max={9999}
            onChange={(value) => setAdjustment({ bottom: value })}
          />
        </div>
      </div>
      {mode === 'bible' && (
        <div className='flex mb-2'>
          <div className='flex-[2] pr-2'>Scroll unit</div>
          <div className='flex-[1]'>
            <InputNumber
              value={scrollUnit}
              min={1}
              max={9999}
              onChange={(value) => setProfile({ scrollUnit: value })}
            />
          </div>
        </div>
      )}
      {mode === 'video' && (
        <>
          <div className='flex mb-2'>
            <div className='flex-[2] flex items-center pr-2' title='Skip forward/backward how many seconds'>
              Skip seconds
              <RotateCcw className='ml-1 w-4 h-4' />
              <RotateCw className='ml-1 w-4 h-4' />
            </div>
            <div className='flex-[1]'>
              <InputNumber
                value={skipSeconds}
                min={1}
                max={9999}
                onChange={(value) => setProfile({ skipSeconds: value })}
              />
            </div>
          </div>
          {/* <div className='flex mb-2'>
            <div className='flex-[2] flex items-center pr-2'>Fade out audio (s)</div>
            <div className='flex-[1]'>
              <InputNumber
                value={fadeOutSeconds}
                min={1}
                max={30}
                onChange={(value) => setProfile({ fadeOutSeconds: value })}
              />
            </div>
          </div> */}
          <div className='flex items-center leading-none'>
            <div title='What to do after video ended'>After Playback</div>
            <div className='flex-grow'>
              <ToggleGroup
                variant='default'
                type='multiple'
                className='justify-end'
                value={[...(loop ? ['loop'] : []), ...(playNext ? ['playNext'] : [])]}
                onValueChange={(val) => {
                  setProfile({ loop: val.includes('loop'), playNext: val.includes('playNext') });
                }}
              >
                <ToggleGroupItem value='loop' className='border-2 border-gray-400'>
                  Loop
                </ToggleGroupItem>
                <ToggleGroupItem value='playNext' className='border-2 border-gray-400 leading-none'>
                  Play Next
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdvanceSettingPane;
