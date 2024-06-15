import { appSettings } from '../../settings/AppSettings';
import { Profile } from '../../../shared/types';

export const profilesHandler = {
  listProfiles: () => appSettings.getProfiles(),
  getProfile: (id: string) => appSettings.getProfile(id),
  getCurrentProfile: () => appSettings.getSelectedProfile() ?? appSettings.getProfiles()[0],
  saveProfile: (profile: Profile) => appSettings.saveProfile(profile),
};
