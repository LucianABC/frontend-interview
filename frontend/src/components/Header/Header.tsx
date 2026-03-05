
import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext'
import { getListById } from '../../api/list';
import Brightness from '../../assets/brightness.svg?react'
import NewFile from '../../assets/new-file.svg?react'
import Search from '../../assets/search.svg?react'
import styles from './Header.module.scss';
import InputWithButton from '../InputWithButton/InputWithButton';

interface Props {
  setShowCreateListDialog: (show: boolean) => void;
}

const Header: React.FC<Props> = ({ setShowCreateListDialog }) => {
  const { theme, toggleTheme } = useTheme();
  const [listSearch, setListSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);


  const toggleSearch = () => {
    setShowSearch(prev => !prev);
  }

  const submitSearch = async () => {
    await getListById(Number(listSearch)).then(list => {
      console.log('List found:', list);
      // You can set the found list to state or navigate to it
    }).catch(error => {
      console.error('Error fetching list:', error);
    });

    toggleSearch()
  }

  return (
    <header className={styles.header}>
      <div className={styles.menu}>
        <button className={styles.headerButton} onClick={() => setShowCreateListDialog(true)}>
          <NewFile height={28} width={28} />
          <h2>Create list</h2>
        </button>
        {showSearch ? (<button className={styles.headerButton} onClick={toggleSearch}>
          <Search height={28} width={28} />
        </button>) : (<div className={styles.search}>
          <InputWithButton
            onAction={submitSearch}
            icon={<Search height={20} width={20} />}
            placeholder="Search list by Id"
            value={listSearch}
            onChange={(e) => setListSearch(e.target.value)}
          />
        </div>)}
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