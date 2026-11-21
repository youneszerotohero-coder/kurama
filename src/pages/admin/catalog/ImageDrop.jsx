import { useRef, useState } from 'react'
import { ImagePlus, Loader2, Star, X, ArrowLeft, ArrowRight } from 'lucide-react'
import { compressImage } from '@/lib/image'
import { cn } from '@/components/ui/Btn'
import { IconBtn } from './ui'

async function filesToImages(files) {
  const list = Array.from(files || []).filter((f) => f.type?.startsWith('image/'))
  return Promise.all(list.map((f) => compressImage(f)))
}

/** Hook: drag & drop + paste + file picker, all funnelled into `onAdd(urls)`. */
function useDrop(onAdd, multiple) {
  const input = useRef(null)
  const [over, setOver] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const take = async (files) => {
    if (!files?.length) return
    setBusy(true)
    setError('')
    try {
      const urls = await filesToImages(multiple ? files : [files[0]])
      if (urls.length) onAdd(urls)
      else setError('Only image files can be added.')
    } catch {
      setError('This image could not be read.')
    } finally {
      setBusy(false)
    }
  }

  const zoneProps = {
    onDragOver: (e) => {
      e.preventDefault()
      setOver(true)
    },
    onDragLeave: () => setOver(false),
    onDrop: (e) => {
      e.preventDefault()
      setOver(false)
      take(e.dataTransfer.files)
    },
    onPaste: (e) => {
      const files = Array.from(e.clipboardData?.items || [])
        .map((i) => i.getAsFile?.())
        .filter(Boolean)
      if (files.length) {
        e.preventDefault()
        take(files)
      }
    },
  }

  const picker = (
    <input
      ref={input}
      type="file"
      accept="image/*"
      multiple={multiple}
      className="hidden"
      onChange={(e) => {
        take(e.target.files)
        e.target.value = ''
      }}
    />
  )

  return { over, busy, error, zoneProps, picker, open: () => input.current?.click() }
}

/** Product gallery: first image is the main one. */
export function GalleryDrop({ images, onChange }) {
  const d = useDrop((urls) => onChange([...images, ...urls]), true)

  const move = (i, dir) => {
    const j = i + dir
    if (j < 0 || j >= images.length) return
    const next = [...images]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  const makeMain = (i) => onChange([images[i], ...images.filter((_, k) => k !== i)])
  const remove = (i) => onChange(images.filter((_, k) => k !== i))

  return (
    <div {...d.zoneProps} tabIndex={0} className="outline-none">
      {d.picker}
      <div className={cn('grid grid-cols-3 gap-2.5 sm:grid-cols-4', d.over && 'opacity-60')}>
        {images.map((src, i) => (
          <div key={src.slice(-40) + i} className="group relative aspect-square overflow-hidden rounded-2xl bg-paper ring-hair">
            <img src={src} alt="" className="h-full w-full object-contain p-2 mix-blend-multiply" />
            {i === 0 ? (
              <span className="eyebrow absolute top-2 rounded-full bg-ink-900 px-2 py-1 text-volt ltr:left-2 rtl:right-2">Main</span>
            ) : null}
            <div className="absolute inset-x-1.5 bottom-1.5 flex justify-between rounded-full bg-ink-900/85 p-0.5 opacity-0 backdrop-blur transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
              <IconBtn label="Move left" className="size-7" onClick={() => move(i, -1)} disabled={i === 0}>
                <ArrowLeft className="size-3.5 rtl:rotate-180" />
              </IconBtn>
              {i !== 0 && (
                <IconBtn label="Make main photo" className="size-7" onClick={() => makeMain(i)}>
                  <Star className="size-3.5" />
                </IconBtn>
              )}
              <IconBtn label="Move right" className="size-7" onClick={() => move(i, 1)} disabled={i === images.length - 1}>
                <ArrowRight className="size-3.5 rtl:rotate-180" />
              </IconBtn>
              <IconBtn label="Remove photo" tone="danger" className="size-7" onClick={() => remove(i)}>
                <X className="size-3.5" />
              </IconBtn>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={d.open}
          className={cn(
            'flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed text-center text-[0.8rem] transition-colors',
            d.over ? 'border-volt bg-volt/25 text-forest' : 'border-ink-900/20 text-ink-900/60 hover:border-volt/60 hover:text-ink-900',
            images.length === 0 ? 'col-span-3 py-10 sm:col-span-4' : 'aspect-square',
          )}
        >
          {d.busy ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
          {images.length === 0 ? (
            <span>
              <span className="block text-ink-900">Drop photos here, paste, or click to browse</span>
              <span className="text-ink-900/65">Optimised automatically · first photo = main</span>
            </span>
          ) : (
            <span>Add</span>
          )}
        </button>
      </div>
      {d.error && <p className="mt-2 text-[0.82rem] text-[#d93025]">{d.error}</p>}
    </div>
  )
}

/** Single image (category / brand / range). */
export function SingleDrop({ value, onChange, className = '', label = 'Image' }) {
  const d = useDrop((urls) => onChange(urls[0]), false)
  return (
    <div {...d.zoneProps} tabIndex={0} className={cn('relative outline-none', className)}>
      {d.picker}
      <button
        type="button"
        onClick={d.open}
        title={label}
        className={cn(
          'group relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed transition-colors',
          value ? 'border-transparent bg-paper' : d.over ? 'border-volt bg-volt/25' : 'border-ink-900/20 hover:border-volt/60',
        )}
      >
        {value ? (
          <img src={value} alt="" className="h-full w-full object-contain p-1.5 mix-blend-multiply" />
        ) : d.busy ? (
          <Loader2 className="size-5 animate-spin text-ink-900/65" />
        ) : (
          <ImagePlus className="size-5 text-ink-900/65 group-hover:text-ink-900" />
        )}
        <span className="sr-only">{label}</span>
      </button>
      {value && (
        <IconBtn label="Remove image" tone="danger" className="absolute -top-2 size-7 bg-paper ring-hair ltr:-right-2 rtl:-left-2" onClick={() => onChange('')}>
          <X className="size-3.5" />
        </IconBtn>
      )}
    </div>
  )
}
