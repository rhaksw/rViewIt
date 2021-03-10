import React, {useState, useEffect, useRef, useLayoutEffect} from 'react'
import { Selection } from './SelectionBase'
import {SimpleURLSearchParams} from 'utils'
import DayPickerInput from 'react-day-picker/DayPickerInput'
import { DateUtils } from 'react-day-picker'
import { useIsMobile } from 'hooks/mobile'

const B = 'before', A = 'after'

const beforeAndAfter = [B, A]
const opposite = {[B]: A, [A]: [B]}
const DATE_UNIT = '-', TIMESTAMP_UNIT = ''
const units = { [DATE_UNIT]: 'date', [TIMESTAMP_UNIT]: 'timestamp', s: 'seconds', m: 'minutes', h: 'hours', d: 'days', w: 'weeks', M: 'months', y: 'years' }
const unitInSeconds = { s: 1, m: 60, h: 3600, d: 86400, w: 604800, M: 2628000, y: 31536000 }

const marginLeft = {marginLeft: '3px'}
const queryParamsOnPageLoad = new SimpleURLSearchParams(window.location.search)
const isSet = queryParamsOnPageLoad.get(B) || queryParamsOnPageLoad.get(A)

const validUnit = (u) => u in units

const parseNumberAndUnit = (paramValue) => {
  return [
    paramValue.replace(/[a-z]/gi,''),
    paramValue.replace(/[^a-z]/gi,'')
  ]
}

const dateToEpoch = (date) => Math.floor(date/1000)

const parseDateISOString = (s) => {
  let ds = s.match(/\d{1,4}/g)
  if (ds.length > 1 && ds[1] > 0) {
    if (ds[1].length > 2) {
      ds = [ds[0], ...ds[1].match(/\d{1,2}/g)]
    }
    ds[1] = ds[1] - 1 // adjust month
  }
  const date = new Date(...ds)
  if (DateUtils.isDate(date)) {
    return date
  }
  return undefined
}

const convertToEpoch = (number, unit) => {
  const now = dateToEpoch(new Date())
  if (! unit) {
    return number
  } else if (unit in unitInSeconds) {
    return now - number*unitInSeconds[unit]
  } else if (unit === DATE_UNIT) {
    const validEpoch = dateToEpoch(parseDateISOString(number))
    if (validEpoch) {
      return validEpoch
    }
  }
  return now
}

const inputLooksLikeDate = (s) => s.match(DATE_UNIT) || s.match(/[./]/)
const defaultSize = 5, extraSize = 2
// from https://itnext.io/reusing-the-ref-from-forwardref-with-react-hooks-4ce9df693dd
function useCombinedRefs(ref) {
  const targetRef = useRef()
  useEffect(() => {
    if (!ref) return

    if (typeof ref === 'function') {
      ref(targetRef.current)
    } else {
      ref.current = targetRef.current
    }
  }, [ref])

  return targetRef
}

const CustomOverlay = React.forwardRef(({classNames, selectedDay, children, ...props}, ref) => {
  const combinedRef = useCombinedRefs(ref)
  const [marginLeft, setMarginLeft] = useState(0)
  useLayoutEffect(() => {
    const rect = combinedRef.current.getBoundingClientRect()
    const widthOfRightNotVisible = rect.right - document.documentElement.clientWidth
    if (widthOfRightNotVisible > 0 && rect.left - widthOfRightNotVisible > 0 ) {
      setMarginLeft(-widthOfRightNotVisible)
    }
  }, [ref])
  return (
    <div className={classNames.overlayWrapper} {...props}>
      <div className={classNames.overlay} ref={combinedRef} style={{marginLeft}}>
        {children}
      </div>
    </div>
  )
})

const getDefaults = () => {
  let beforeOrAfter = B, number = '', unit = DATE_UNIT
  const param_b = queryParamsOnPageLoad.get(B)
  const param_a = queryParamsOnPageLoad.get(A)
  if (param_b) {
    beforeOrAfter = B;
    [number, unit] = parseNumberAndUnit(param_b)
  } else if (param_a) {
    beforeOrAfter = A;
    [number, unit] = parseNumberAndUnit(param_a)
  }
  if (beforeOrAfter && number) {
    if (number.match(/^\d{10,}$/) && unit === TIMESTAMP_UNIT) {
      const d = new Date(0)
      d.setUTCSeconds(number)
      number = [d.getFullYear(),
                d.getMonth()+1,
                d.getDate()]
                .join('-')+' '+
                  [d.getHours(),
                   d.getMinutes(),
                   d.getSeconds()].join(':')
      unit = DATE_UNIT
    }
  }
  return {beforeOrAfter, number, unit}
}

const BeforeAfter = ({...selectionProps}) => {
  const queryParams = new SimpleURLSearchParams(window.location.search)
  const [meta, setMeta] = useState(getDefaults())
  const dayPickerRef = useRef(null)
  const agoInputRef = useRef(null)
  const overlayRef = useRef(null)
  const isMobile = useIsMobile()

  useEffect(() => {
  }, [])
  const reset = () => {
    queryParams.delete(B)
    queryParams.delete(A)
    window.location.href = queryParams.toString()
  }
  const onSubmit = (e) => {
    e.preventDefault()
    if (parseInt(meta.number) > 0) {
      queryParams.delete(opposite[meta.beforeOrAfter])
      queryParams.set(meta.beforeOrAfter, convertToEpoch(meta.number,meta.unit))
      window.location.href = queryParams.toString()
    } else if (isSet && (meta.number == 0 || meta.number == '')) {
      reset()
    }
  }
  const onKeyPress = (e) => {
    if (e.keyCode === 13) {
      onSubmit(e)
    }
  }
  const sharedInputProps = {
    size: meta.number && meta.number.length > (defaultSize+extraSize) ? meta.number.length-extraSize : defaultSize,
    style: {...marginLeft, textAlign:'right'},
    onKeyPress,
  }
  useEffect(() => {
    if (! isSet && inputLooksLikeDate(meta.number)) {
      dayPickerRef.current.input.focus()
    } else if (meta.unit in unitInSeconds) {
      agoInputRef.current.focus()
    }
  }, [meta.number, meta.unit])

  return (
    <Selection className='beforeAfter' isFilter={true} isSet={isSet} {...selectionProps}>
      <form onSubmit={onSubmit}>
        <select value={meta.beforeOrAfter} onChange={(e) => {
          setMeta({...meta, beforeOrAfter: e.target.value})
        }}>
          {beforeAndAfter.map(x => <option key={x} value={x}>{x}</option>)}
        </select>
        {meta.unit !== DATE_UNIT ?
          <input type='text' placeholder='0' value={meta.number} ref={agoInputRef}
                 onChange={(e) => {
                   let [number, unit] = parseNumberAndUnit(e.target.value)
                   if (inputLooksLikeDate(number)) {
                     unit = DATE_UNIT
                   }
                   if (validUnit(unit)) {
                     setMeta({...meta, number, ...(unit && {unit})})
                   }
                 }}
                 {...sharedInputProps}
           />
        :
          <DayPickerInput value={meta.number} ref={dayPickerRef}
            onDayChange={(day, modifiers, dayPickerInput) => {
              const value = dayPickerInput.getInput().value
              let [number, unit] = parseNumberAndUnit(value)
              if (! unit) {
                number = value
              } else if (inputLooksLikeDate(value)) {
                unit = DATE_UNIT
              }
              setMeta({...meta, number, ...(unit && {unit})})
            }}
            overlayComponent={props => <CustomOverlay {...props} ref={overlayRef}/>}
            parseDate={parseDateISOString}
            inputProps={{
              ...sharedInputProps,
              readOnly: isMobile,
              placeholder: 'Y-m-d',
            }}
          />
        }
        <div style={{marginTop: '3px'}}>
          <select value={meta.unit} onChange={(e) => {
            // reset value when changing b/w date and any other unit
            const number = [meta.unit, e.target.value].includes(DATE_UNIT) ? '' : meta.number
            setMeta({...meta, number, unit: e.target.value})
          }}>
            {Object.entries(units).map(([k, v]) => <option key={k} value={k}>{v + (k in unitInSeconds ? ' ago':'')}</option>)}
          </select>
          <input type='submit' value='go' style={marginLeft} onClick={onSubmit}/>
        </div>
        {isSet && <div style={{textAlign:'center'}}><a className='pointer' onClick={reset}>[x] reset</a></div>}
      </form>
    </Selection>
  )
}

export default BeforeAfter
