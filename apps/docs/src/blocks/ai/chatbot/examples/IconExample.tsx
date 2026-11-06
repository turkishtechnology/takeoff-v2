import { ChatbotIcon } from '../Chatbot';

const types = [
  { name: 'white', className: 'text-static-white', surface: 'bg-neutral-900' },
  { name: 'light', className: 'text-neutral-200', surface: '' },
  { name: 'dark', className: 'text-neutral-900', surface: '' },
  { name: 'primary', className: 'text-primary-base', surface: '' },
];

const sizes = [
  { name: 'small', className: 'size-8' },
  { name: 'base', className: 'size-10' },
  { name: 'large', className: 'size-12' },
];

export default function IconExample() {
  return (
    <div className="mx-auto grid w-fit grid-cols-[auto_repeat(4,4.5rem)] items-center gap-3 text-center text-xs text-text-base">
      <span />
      {types.map(type => (
        <span key={type.name}>{type.name}</span>
      ))}
      {sizes.map(size => (
        <div key={size.name} className="contents">
          <span className="text-left">{size.name}</span>
          {types.map(type => (
            <span key={type.name} className={`flex h-16 items-center justify-center rounded-lg ${type.surface}`}>
              <ChatbotIcon className={`${size.className} ${type.className}`} />
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
