import {
  Box,
  Flex,
  Button,
  Stack,
  useColorMode,
  Text,
  Link,
  useBreakpointValue,
} from '@chakra-ui/react'
import { MoonIcon, SunIcon } from '@chakra-ui/icons'
import NextLink from 'next/link'
import { MutableRefObject } from 'react'
import AutocompleteInput from './AutocompleteInput'
import { RiHeartFill } from 'react-icons/ri'
import { useRouter } from 'next/router'
export default function Nav({
  refBackdrop,
}: {
  refBackdrop: MutableRefObject<HTMLDivElement>
}): JSX.Element {
  const { colorMode, toggleColorMode } = useColorMode()
  const titleHeader = useBreakpointValue({ base: 'UT', md: 'Ultimate-Tab' })
  const router = useRouter();
  return (
    <>
      <Box px={4}>
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <Flex alignItems={'center'}>
            <Link as={NextLink} href="/" style={{ textDecoration: 'none' }}>
              <Text
                bg="fadebp"
                bgClip="text"
                fontSize={useBreakpointValue({ base: 'xl', md: 'xl' })}
                mr={4}
                fontWeight="extrabold"
                whiteSpace={'nowrap'}
              >
                {titleHeader}
              </Text>
            </Link>
          </Flex>
          <Flex alignItems={'center'} width={'100%'}>
            <AutocompleteInput refBackdrop={refBackdrop} />
          </Flex>
          <Flex alignItems={'center'}>
            <Stack direction={'row'} spacing={5}>
            <Button
                size={useBreakpointValue({ base: 'sm', md: 'md' })}
                onClick={() => router.push('/favourites')}
                backgroundColor={(() => {
                   if (router.pathname.includes("favourites")) {
                      return colorMode === 'light' ? 'rgb(0, 166, 255)' : '#0072B6';
                   } else {
                        return colorMode === 'light' ? 'gray.200' : 'whiteAlpha.300';
                   }
                })()}
              >
                <RiHeartFill />&nbsp; Favourites
              </Button>
              <Button
                size={useBreakpointValue({ base: 'sm', md: 'md' })}
                onClick={toggleColorMode}
              >
                {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              </Button>

            </Stack>
          </Flex>
        </Flex>
      </Box>
    </>
  )
}
