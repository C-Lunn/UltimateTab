import { extendTheme, StyleFunctionProps } from '@chakra-ui/react'

export const extendedTheme = extendTheme({
  initialColorMode: 'light',
  colors: {
    fadebp: 'linear-gradient(to left, #7928CA, #1a94da) padding-box',
  },
  styles: {
    global: (props: StyleFunctionProps) => ({
      'span.js-chord-chord': {
        cursor: 'pointer',
        color: 'twitter.500 !important',
        fontWeight: 'bold',
        background:
          props.colorMode === 'dark' ? '#313131' : '#EDF2F7',
        padding: '0.01rem 0.15rem',
      },
      'pre, code': {
        fontFamily: `'Poppins Mono', monospace !important`,
      },
      '.PlayerRSWP': {
        bgColor: props.colorMode === 'dark' && '#1a202c !important',
      },
      '.slider__thumb,.volume__thumb': {
        bgColor: props.colorMode === 'dark' && 'twitter.600 !important',
      },
      '.rswp_progress,.rswp_duration,._ControlsButtonsRSWP,._VolumeInlineRSWP,._DevicesRSWP button,._ContentRSWP a':
      {
        color: props.colorMode === 'dark' && 'gray.300  !important',
      },
      '._ContentWrapperRSWP path': {
        fill: props.colorMode === 'dark' && 'gray.300  !important',
      },
      '.chord--diagram circle[fill="#ffffff"]': {
        fill: 'transparent !important',
      },
      '.chord--diagram circle, .chord--diagram rect': {
        fill: props.colorMode === 'dark' && 'twitter.600 !important',
        stroke: props.colorMode === 'dark' && 'twitter.600 !important',
      },
      '.chord--diagram text': {
        stroke: props.colorMode === 'dark' && 'gray.200 !important',
      },
      '@keyframes blink_input_opacity_to_prevent_scrolling_when_focus': {
        '0%': {
          opacity: 0,
        },
        '100%': {
          opacity: 1,
        },
      },
      /* Hack to prevent iOS Safari to zoom and scroll on input when focused */
      'input:focus': {
        animation: 'blink_input_opacity_to_prevent_scrolling_when_focus 0.01s',
      },

      /* Style odd and even sections */
      '.tabrender-section:nth-of-type(odd)': {
        background: props.colorMode === 'dark' ? 'rgb(26, 32, 44)' : '#EDF2F7',
      },
      '.tabrender-section:nth-of-type(even)': {
        background: props.colorMode === 'dark' ? 'rgb(32, 38, 49)' : '#EDF2F7',
      },


    }),
  },
  fonts: {
    body: `'Poppins', sans-serif`,
  },
})
