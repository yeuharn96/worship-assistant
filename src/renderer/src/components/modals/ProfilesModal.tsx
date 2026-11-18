import { KeyboardEvent, useState } from 'react';
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { ProfileInfo } from 'src/shared/types';
import useProfileStore from '@renderer/store/profile';
import useProfileListStore from '@renderer/store/profileList';
import useOutputStore from '@renderer/store/output';
import useModalStore from '@renderer/store/modal';
import { Button } from '../ui/button';

const iconButton = 'h-8 w-8 p-0 shrink-0';

/** Escape cancels the edit in place instead of closing the dialog. */
const handleInputKeys = (e: KeyboardEvent, onEnter: () => void, onEscape?: () => void) => {
  if (e.key === 'Enter') onEnter();
  if (e.key === 'Escape' && onEscape) {
    e.preventDefault();
    e.stopPropagation();
    onEscape();
  }
};

const ProfilesModal = () => {
  const activeId = useProfileStore((s) => s.profile.id);
  const { profiles, switchTo, create, rename, remove } = useProfileListStore();
  const isShowing = useOutputStore((s) => s.isShowing);
  const { closeGlobalModal } = useModalStore();
  const activeName = profiles.find((p) => p.id === activeId)?.name;

  const [error, setError] = useState<string>();
  const [editing, setEditing] = useState<{ id: string; name: string }>();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string>();
  const [newName, setNewName] = useState('');
  const [startFrom, setStartFrom] = useState<'current' | 'default'>('current');

  /** Run a profile action, showing its error (if any). Resolves to true if it succeeded. */
  const run = async (action: Promise<string | undefined>) => {
    const result = await action;
    setError(result);
    return !result;
  };

  const startRename = (p: ProfileInfo) => {
    setConfirmDeleteId(undefined);
    setError(undefined);
    setEditing({ id: p.id, name: p.name });
  };
  const saveRename = async () => {
    if (editing && (await run(rename(editing.id, editing.name)))) setEditing(undefined);
  };

  const handleCreate = async () => {
    if (await run(create(newName, startFrom))) setNewName('');
  };

  return (
    <div className='w-[36rem] max-w-[90vw] p-6 flex flex-col gap-4'>
      <div>
        <div className='text-2xl font-bold'>Profiles</div>
        <p className='text-sm text-gray-400 mt-1'>
          Each profile keeps its own text, background, playlist and output adjustment settings.
        </p>
      </div>

      <ul className='border-2 border-gray-600 rounded max-h-[40vh] overflow-auto divide-y divide-gray-700'>
        {profiles.map((p) => {
          const isActive = p.id === activeId;
          const isEditing = editing?.id === p.id;
          const isConfirmingDelete = confirmDeleteId === p.id;
          return (
            <li key={p.id} className='flex items-center gap-2 px-3 py-2 min-h-[3rem]'>
              {isEditing ? (
                <>
                  <input
                    autoFocus
                    className='input-primary h-8 px-2'
                    value={editing.name}
                    maxLength={40}
                    onChange={(e) => setEditing({ id: p.id, name: e.target.value })}
                    onKeyDown={(e) => handleInputKeys(e, saveRename, () => setEditing(undefined))}
                  />
                  <Button variant='border' className={iconButton} title='Save name' onClick={saveRename}>
                    <Check className='h-4 w-4' />
                  </Button>
                  <Button
                    variant='border'
                    className={iconButton}
                    title='Cancel'
                    onClick={() => {
                      setEditing(undefined);
                      setError(undefined);
                    }}
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </>
              ) : (
                <>
                  <span className='flex-grow truncate' title={p.name}>
                    {p.name}
                  </span>
                  {isActive ? (
                    <span className='text-xs uppercase tracking-wide text-green-400 px-2'>Active</span>
                  ) : isConfirmingDelete ? null : (
                    <Button
                      variant='border'
                      className='h-8 px-3'
                      disabled={isShowing}
                      title={isShowing ? 'Hide the output to switch profiles' : undefined}
                      onClick={() => run(switchTo(p.id))}
                    >
                      Use
                    </Button>
                  )}
                  {isConfirmingDelete ? (
                    <>
                      <span className='text-sm text-red-400'>Delete?</span>
                      <Button
                        variant='destructive'
                        className='h-8 px-3'
                        onClick={async () => {
                          if (await run(remove(p.id))) setConfirmDeleteId(undefined);
                        }}
                      >
                        Delete
                      </Button>
                      <Button variant='border' className='h-8 px-3' onClick={() => setConfirmDeleteId(undefined)}>
                        Keep
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant='border' className={iconButton} title='Rename' onClick={() => startRename(p)}>
                        <Pencil className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='border'
                        className={`${iconButton} disabled:cursor-not-allowed`}
                        disabled={isActive || profiles.length <= 1}
                        title={isActive ? 'Switch to another profile to delete this one' : 'Delete'}
                        onClick={() => {
                          setEditing(undefined);
                          setError(undefined);
                          setConfirmDeleteId(p.id);
                        }}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </>
                  )}
                </>
              )}
            </li>
          );
        })}
      </ul>

      <div className='flex flex-col gap-2'>
        <div className='font-medium'>New profile</div>
        <div className='flex gap-2'>
          <input
            className='input-primary h-8 px-2'
            placeholder='Name, e.g. Youth Service'
            value={newName}
            maxLength={40}
            disabled={isShowing}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => handleInputKeys(e, handleCreate)}
          />
          <select
            className='input-primary h-8 w-auto max-w-[45%]'
            value={startFrom}
            disabled={isShowing}
            onChange={(e) => setStartFrom(e.target.value as 'current' | 'default')}
          >
            <option value='current'>Copy of “{activeName}”</option>
            <option value='default'>Default settings</option>
          </select>
          <Button variant='border' className='h-8 px-3 shrink-0' disabled={isShowing} onClick={handleCreate}>
            <Plus className='h-4 w-4 mr-1' /> Create
          </Button>
        </div>
        {isShowing && (
          <p className='text-sm text-yellow-400'>
            Hide the output to create or switch profiles, since that changes what is on the screen.
          </p>
        )}
      </div>

      {error && <p className='text-sm text-red-400'>{error}</p>}

      <div className='flex justify-center'>
        <Button variant='secondary' className='px-20' onClick={closeGlobalModal}>
          Close
        </Button>
      </div>
    </div>
  );
};

export default ProfilesModal;
