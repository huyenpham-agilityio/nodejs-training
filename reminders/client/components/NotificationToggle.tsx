interface NotificationToggleProps {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}

export default function NotificationToggle({
  id,
  title,
  description,
  checked,
  disabled = false,
  onChange,
}: NotificationToggleProps) {
  return (
    <div className='flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'>
      <div className='flex-1'>
        <h3 className='font-semibold text-gray-900'>{title}</h3>
        <p className='text-sm text-gray-600 mt-1'>{description}</p>
      </div>
      <label
        htmlFor={id}
        className='relative inline-flex items-center cursor-pointer'
      >
        <input
          id={id}
          type='checkbox'
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className='sr-only peer'
        />
        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"></div>
      </label>
    </div>
  );
}
