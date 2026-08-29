import React, { useState, useEffect, useRef } from 'react';
import { EmojiCategory } from '../../types/notebook';

export interface EmojiPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEmoji: (emoji: string) => void;
  className?: string;
}

export const EMOJI_CATEGORIES: Array<{ id: EmojiCategory; label: string; icon: string }> = [
  { id: 'smileys', label: 'Smileys & Emotion', icon: '😀' },
  { id: 'gestures', label: 'People & Gestures', icon: '👋' },
  { id: 'books', label: 'Books & Stationery', icon: '📚' },
  { id: 'nature', label: 'Nature & Animals', icon: '🌿' },
  { id: 'food', label: 'Food & Drink', icon: '☕' },
  { id: 'objects', label: 'Objects & Tools', icon: '💡' },
  { id: 'symbols', label: 'Symbols & Shapes', icon: '❤️' },
];

export const EMOJI_DATA: Record<EmojiCategory, string[]> = {
  smileys: [
    '😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩',
    '😘','😗','😚','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐',
    '😑','😶','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢',
    '🤮','🤧','🥵','🥶','🥴','😵','🤯','🤠','🥳','😎','🤓','🧐','😕','😟','🙁','😮',
    '😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓',
    '😩','😫','🥱','😤'
  ],
  gestures: [
    '👋','🤚','🖐️','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆',
    '🖕','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','✍️',
    '💅','🤳','💪','🦾','🦿','🦵','🦶','👂','🦻','👃','🧠','🫀','🫁','🦷','🦴','👀',
    '👁️','👅','👄'
  ],
  books: [
    '📚','📖','📕','📗','📘','📙','📓','📔','📒','📜','📄','📰','📑','🔖','🏷️','📝',
    '✏️','✒️','🖋️','🖊️','🖌️','🖍️','📌','📍','📎','🖇️','📏','📐','📋','📁','📂','🗂️',
    '🗃️','🗳️','🏛️','🎓','🎒'
  ],
  nature: [
    '🌿','🌱','🌲','🌳','🌴','🌵','🌾','🍀','🍁','🍂','🍃','🌸','🌹','🌺','🌻','🌼',
    '🌷','🐾','🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸',
    '🐵','🐔','🐧','🐦','🦅','🦆','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌',
    '🐞','🐜','🦟','🦗','🕷️','🦂','🐢','🐍','🦎','🐙','🦑','🦐','🦞','🦀','🐡','🐠',
    '🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🦍','🦧','🐘','🦛','🦏','🐪','🐫',
    '🦒','🦘','🐃','🐂','🐄','🐎','🐖','🐏','🐑','🦙','🐐','🦌','🐕','🐩','🦮','🐕‍🦺',
    '🐈','🐈‍⬛','🐓','🦃','🦚','🦜','🦢','🦩','🕊️','🐇','🦝','🦨','🦡','🦦','🦥','🐁',
    '🐀','🐿️','🦔'
  ],
  food: [
    '☕','🍵','🧃','🥤','🧋','🍶','🍺','🍻','🥂','🍷','🥃','🍸','🍹','🧉','🍾','🍎',
    '🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅',
    '🥑','🥦','🥬','🥒','🌶️','🫑','🌽','🥕','🫒','🧄','🧅','🥔','🍠','🥐','🥯','🍞',
    '🥖','🥨','🧀','🥚','🍳','🧈','🥞','🧇','🥓','🥩','🍗','🍖','🌭','🍔','🍟','🍕',
    '🫓','🥪','🥙','🧆','🌮','🌯','🫔','🥗','🥘','🫕','🥣','🍝','🍜','🍲','🍛','🍣',
    '🍱','🥟','🦪','🍤','🍙','🍚','🍘','🍥','🥠','🥮','🍢','🍡','🍧','🍨','🍦','🥧',
    '🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','🌰','🥜','🍯'
  ],
  objects: [
    '💡','🕯️','🔦','🏮','🪔','🧱','🪵','🪨','🧭','⏱️','⏲️','⏰','🕰️','⌛','⏳','📡',
    '🔋','🪫','🔌','💻','🖥️','🖨️','⌨️','🖱️','🖲️','💽','💾','💿','📀','📱','☎️','📞',
    '📟','📠','📺','📻','🎙️','🎚️','🎛️','🛑','🚧','🚨','🛞','⚓','🛟','🪝','🧰','🧲',
    '🪜','🪛','🔧','🔨','⚒️','🛠️','⛏️','🪓','🪚','🔩','⚙️','🪤','🗝️','🔑','🔒','🔓',
    '🔏','🔐'
  ],
  symbols: [
    '❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❤️‍🔥','❤️‍🩹','❣️','💕','💞','💓',
    '💗','💖','💘','💝','💟','☮️','✝️','☪️','🕉️','☸️','✡️','🔯','🕎','☯️','☦️','🛐',
    '🆔','⚛️','🉑','☢️','☣️','📴','📳','🈶','🈚','🈸','🈺','🈷️','✴️','❇️','✨','🌟',
    '⭐','🌠','💫','⚡','☄️','💥','🔥','🌪️','🌈','☀️','🌤️','⛅','🌥️','☁️','🌦️','🌧️',
    '🌨️','🌩️','❄️','☃️','⛄','🌬️','💨','💧','💦','🫧','☔','☂️','🌊','🎉','🎊','🎈',
    '🎂','🎁','🎖️','🏆','🏅','🥇','🥈','🥉'
  ],
};

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  isOpen,
  onClose,
  onSelectEmoji,
  className = '',
}) => {
  const [activeCategory, setActiveCategory] = useState<EmojiCategory>('smileys');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Handle outside click & escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Determine which emojis to display
  const getDisplayedEmojis = (): string[] => {
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      const all: string[] = [];
      Object.values(EMOJI_DATA).forEach((categoryList) => {
        all.push(...categoryList);
      });
      return all;
    }
    return EMOJI_DATA[activeCategory] || EMOJI_DATA.smileys;
  };

  const displayedEmojis = getDisplayedEmojis();

  return (
    <div
      id="emojiPicker"
      ref={popoverRef}
      className={`emoji-picker-popover ${className}`}
      role="dialog"
      aria-label="Emoji Picker"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="emoji-header">
        <input
          id="emojiSearch"
          ref={searchInputRef}
          type="text"
          className="emoji-search-input"
          placeholder="Search emojis..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search emojis"
        />
        <button
          type="button"
          id="closeEmojiPickerBtn"
          className="emoji-close-btn"
          onClick={onClose}
          title="Close emoji picker"
        >
          ✕
        </button>
      </div>

      <div id="emojiCategories" className="emoji-categories">
        {EMOJI_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`emoji-cat-btn ${activeCategory === cat.id && !searchQuery ? 'active' : ''}`}
            data-cat={cat.id}
            title={cat.label}
            onClick={() => {
              setActiveCategory(cat.id);
              setSearchQuery('');
            }}
          >
            {cat.icon}
          </button>
        ))}
      </div>

      <div id="emojiGrid" className="emoji-grid">
        {displayedEmojis.map((emoji, idx) => (
          <button
            key={`${emoji}-${idx}`}
            type="button"
            className="emoji-item-btn"
            title={emoji}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSelectEmoji(emoji);
            }}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmojiPicker;
