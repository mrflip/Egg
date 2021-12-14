import { ref } from 'vue';

import { getLocalStorage, setLocalStorage } from 'lib';

type SectionVisibility = { [section: string]: boolean };

const SECTION_VISIBILITY_LOCALSTORAGE_KEY = 'sectionVisibility';

export function useSectionVisibility(): {
  isVisibleSection: (section: string, initial?: boolean) => boolean;
  toggleSectionVisibility: (section: string) => void;
} {
  const sectionVisibility = ref(loadSectionVisibilityFromLocalStorage());
  const isVisibleSection = (section: string, initial?: boolean) => {
    const val = sectionVisibility.value[section]
    if (val === undefined) {
      sectionVisibility.value[section] = (initial !== false)
      return (initial !== false)
    }
    return val !== false;
  };
  const toggleSectionVisibility = (section: string) => {
    const current = sectionVisibility.value[section] !== false;
    sectionVisibility.value[section] = !current;
    persistSectionVisibilityToLocalStorage(sectionVisibility.value);
  };
  return {
    isVisibleSection,
    toggleSectionVisibility,
  };
}

function loadSectionVisibilityFromLocalStorage(): SectionVisibility {
  const encoded = getLocalStorage(SECTION_VISIBILITY_LOCALSTORAGE_KEY) || '{}';
  try {
    const visibility: SectionVisibility = {};
    for (const [key, val] of Object.entries(JSON.parse(encoded))) {
      // if (val === false) {
      visibility[key] = val as boolean;
      // }
    }
    return visibility;
  } catch (e) {
    console.error(`error loading sectionVisibility from localStorage: ${e}`);
    return {};
  }
}

function persistSectionVisibilityToLocalStorage(value: SectionVisibility) {
  setLocalStorage(SECTION_VISIBILITY_LOCALSTORAGE_KEY, JSON.stringify(value));
}
