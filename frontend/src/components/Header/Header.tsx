
import React, { useRef, useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext'
import Brightness from '../../assets/brightness.svg?react'
import NewFile from '../../assets/new-file.svg?react'
import Search from '../../assets/search.svg?react'
import styles from './Header.module.scss';
import InputWithButton from '../InputWithButton/InputWithButton';
import { useLists } from '../../context/ListsContext';

interface Props {
  setShowCreateListDialog: (show: boolean) => void;
}

const Header: React.FC<Props> = ({ setShowCreateListDialog }) => {
  const { theme, toggleTheme } = useTheme();
  const { getListById } = useLists();
  const [listSearch, setListSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (showSearch) {
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    }
  }, [showSearch]);

  const toggleSearch = () => {
    setShowSearch(prev => !prev);
  }

  const submitSearch = async () => {
    await getListById(Number(listSearch))
    setListSearch('')
    toggleSearch()
  }

  return (
    <header className={styles.header}>
      <div className={styles.menu}>
        <button onClick={() => setShowCreateListDialog(true)}>
          <NewFile height={28} width={28} />
        </button>
        {showSearch ? (<div className={styles.search}>
          <InputWithButton
            ref={searchInputRef}
            onBlur={() => setShowSearch(false)}
            onAction={submitSearch}
            icon={<Search height={20} width={20} />}
            placeholder="Search list by Id"
            value={listSearch}
            onChange={(e) => setListSearch(e.target.value)}
          />
        </div>) : (<button onClick={toggleSearch} >
          <Search height={28} width={28} />
        </button>)}
      </div>

      <label className={styles.switch}>
        <input
          type="checkbox"
          onChange={toggleTheme}
          checked={theme === 'dark'}
        />
        <span className={styles.slider}>
          <span className={styles.circle}></span>
        </span>
        <Brightness height={28} width={28} />
      </label>
    </header>
  );
};

export default Header;