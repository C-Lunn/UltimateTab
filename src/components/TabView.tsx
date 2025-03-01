import { AddIcon, ChevronDownIcon, MinusIcon, StarIcon } from '@chakra-ui/icons'
import {
  Badge,
  Box,
  Button,
  Flex,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Skeleton,
  Text,
  Tooltip,
  useBreakpointValue,
  useColorModeValue
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { MouseEventHandler, useEffect, useState } from 'react'
import { FaPlayCircle } from 'react-icons/fa'
import { FaCircleArrowDown } from 'react-icons/fa6'
import { GiCrowbar, GiGuitarHead, GiMusicalScore } from 'react-icons/gi'
import { HiArrowsUpDown } from 'react-icons/hi2'
import { MdFontDownload } from 'react-icons/md'
import { RiHeartFill, RiHeartLine } from 'react-icons/ri'
import useAppStateContext from '../hooks/useAppStateContext'
import { Tab, UGChordCollection } from '../types/tabs'
import Autoscroller from './Autoscroller'
import BackingtrackPlayer from './BackingtrackPlayer'
import ChordDiagram from './ChordDiagram'
import ChordTransposer from './ChordTransposer'
import Difficulty from './Difficulty'
import TabRenderer from './TabRenderer'

interface TabPanelProps {
  selectedTab: Tab
  isFavorite: boolean
  selectedTabContent: Tab
  isLoading: boolean
  handleClickFavorite: MouseEventHandler<HTMLButtonElement>
  refetchTab: Function
}

export default function TabView({
  isFavorite,
  selectedTabContent,
  isLoading,
  handleClickFavorite,
  refetchTab,
}: TabPanelProps) {
  const router = useRouter()
  const { tabFontSize, setTabFontSize } = useAppStateContext()

  const [chordsDiagrams, setChordsDiagrams] = useState<UGChordCollection[]>(
    selectedTabContent?.chordsDiagrams,
  )
  const [showAutoscroll, setShowAutoscroll] = useState<boolean>(false)

  const [showBackingTrack, setShowBackingTrack] = useState<boolean>(false)
  const [transpose, set_transpose] = useState(0);

  const TransposeElement = () => {
    return (
      <Flex display={'flex'} fontSize={'sm'} alignItems={'center'}>
        <Text color={'gray.500'} as="b" mr={1}>
          {' '}
          Transpose{' '}
        </Text>
        <Icon boxSize={5} as={HiArrowsUpDown} mr={1} />
        <IconButton
          variant="outline"
          _hover={{
            bg: 'twitter.400',
            color: 'white',
          }}
          size={'sm'}
          boxShadow="md"
          fontWeight={'normal'}
          px="3"
          py="4"
          onClick={() => set_transpose(transpose === -11 ? 0 : transpose - 1)}
          aria-label="Transpose down"
          icon={<MinusIcon />}
        />
        <Badge mx={2} variant="subtle" fontSize={'sm'} color={'twitter.600'}>
          {transpose}
        </Badge>
        <IconButton
          variant="outline"
          _hover={{
            bg: 'twitter.400',
            color: 'white',
          }}
          size={'sm'}
          boxShadow="md"
          fontWeight={'normal'}
          px="3"
          py="4"
          onClick={() => set_transpose(transpose === 11 ? 0 : transpose + 1)}
          aria-label="Transpose up"
          icon={<AddIcon />}
        />
      </Flex>
    )
  }


  const flexSongNameDirection = useBreakpointValue({
    base:
      selectedTabContent &&
        selectedTabContent.artist?.length + selectedTabContent.name?.length > 30
        ? 'column'
        : 'row',
    sm: 'row',
  })
  const borderLightColor = useColorModeValue('gray.200', 'gray.700')
  const widthThirdRow = useBreakpointValue({ base: '100%', md: 'initial' })
  const marginTopThirdRow = useBreakpointValue({ base: 0, md: 2 })
  const paddingTopThirdRow = useBreakpointValue({ base: 1, md: 0 })

  const fontSizeValues = [50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150]

  useEffect(() => {
    setChordsDiagrams(selectedTabContent?.chordsDiagrams)
  }, [selectedTabContent])

  return (
    <>
      <Box
        h="100%"
        px={5}
        py={2}
        borderBottomStyle={'solid'}
        borderBottomWidth={selectedTabContent && '1px'}
        borderBottomColor={borderLightColor}
      >
        <Skeleton
          justifyContent={'space-between'}
          flexDirection="column"
          display={'flex'}
          h="100%"
          isLoaded={!isLoading}
        >
          <Flex justifyContent={'space-between'} alignItems={'center'}>
            <Flex alignItems={'center'} pb={0}>
              <Flex
                alignItems={'baseline'}
                flexDirection={flexSongNameDirection as 'row' | 'column'}
                py={1}
              >
                <Text fontSize={'lg'} as="b" mr={1}>
                  {selectedTabContent?.artist}
                </Text>{' '}
                <Text fontSize={'md'}>{selectedTabContent?.name}</Text>
              </Flex>
            </Flex>
            <Flex fontSize={'sm'} justifyContent={'start'}>
              <Tooltip
                placement="right"
                label={
                  isFavorite ? 'Remove from favorites' : 'Add to favorites'
                }
              >
                <IconButton
                  icon={isFavorite ? <RiHeartFill /> : <RiHeartLine />}
                  onClick={handleClickFavorite}
                  colorScheme={isFavorite ? 'red' : 'gray'}
                  variant="ghost"
                  aria-label="Add to favorites"
                  size={'md'}
                />
              </Tooltip>
            </Flex>
          </Flex>
          <Flex alignItems={'center'} justifyContent={'space-between'} py={1}>
            {
              // Hack with top and relative position to make the star icon perfectly vertically aligned
            }
            <Flex alignItems={'center'}>
              <StarIcon
                fontSize={'sm'}
                color={'yellow.400'}
                position="relative"
                top="-0.05rem"
                mr={'5px'}
              />{' '}
              <Flex>
                {selectedTabContent?.rating} ({selectedTabContent?.numberRates})
              </Flex>
            </Flex>
            {selectedTabContent?.versions.length > 0 && (
              <Menu>
                <MenuButton
                  as={Button}
                  variant="outline"
                  _hover={{
                    bg: 'twitter.300',
                    color: 'white',
                  }}
                  _active={{
                    bg: 'twitter.600',
                    color: 'white',
                  }}
                  size={'sm'}
                  boxShadow="md"
                  fontWeight={'normal'}
                  px="3"
                  py="1"
                  rightIcon={<ChevronDownIcon />}
                  leftIcon={
                    <Icon
                      fontSize={'sm'}
                      color={'yellow.400'}
                      position="relative"
                      top="-0.05rem"
                      as={StarIcon}
                    />
                  }
                >
                  More versions
                </MenuButton>
                <MenuList>
                  {selectedTabContent?.versions?.map((tab) => (
                    <MenuItem
                      onClick={() => {
                        router.push(`/tab/${tab.slug}`)
                      }}
                      key={tab.slug}
                    >
                      <StarIcon
                        fontSize={'sm'}
                        color={'yellow.400'}
                        position="relative"
                        top="-0.05rem"
                        mr={'5px'}
                      />{' '}
                      {tab.rating} ({tab.numberRates})
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
            )}
          </Flex>
          <Flex justifyContent={'space-between'} flexDirection={'row'}>
            <Flex fontSize={'sm'} py={2}>
              <Text color={'gray.500'} as="b" mr={1}>
                Key
              </Text>{' '}
              <Icon boxSize={5} as={GiMusicalScore} mr={1} />
              {selectedTabContent?.tonality}
            </Flex>{' '}
            <Flex fontSize={'sm'} py={2}>
              <Text color={'gray.500'} as="b" mr={1}>
                Capo
              </Text>{' '}
              <Icon boxSize={5} as={GiCrowbar} mr={1} />
              {selectedTabContent?.capo}
            </Flex>{' '}
          </Flex>
          <Flex
            justifyContent={'space-between'}
            flexDirection={useBreakpointValue({ base: 'column', sm: 'row' })}
          >
            <Flex fontSize={'sm'} py={2}>
              <Text color={'gray.500'} as="b" mr={1}>
                Difficulty
              </Text>{' '}
              <Difficulty level={selectedTabContent?.difficulty} />
            </Flex>{' '}
            <Flex fontSize={'sm'} py={2}>
              <Text color={'gray.500'} as="b" mr={1}>
                Tuning
              </Text>{' '}
              <Icon boxSize={5} as={GiGuitarHead} mr={1} />
              {selectedTabContent?.tuning.join(' ')}
            </Flex>{' '}
          </Flex>

          <Flex
            justifyContent={'space-between'}
            flexDirection={useBreakpointValue({ base: 'column', md: 'row' })}
            alignItems={'center'}
          >
            {chordsDiagrams && selectedTabContent?.type === 'Chords' && (
              <Flex
                pb={1}
                justifyContent={'start'}
                w={widthThirdRow}
                mt={marginTopThirdRow}
                pt={paddingTopThirdRow}
              >
                <TransposeElement />
              </Flex>
            )}

            <Flex pb={1} w={widthThirdRow} pt={0} flexWrap={'wrap'}>
              <Button
                variant="outline"
                _hover={{
                  bg: 'twitter.400',
                  color: 'white',
                  opacity: showBackingTrack ? 0.8 : 1,
                }}
                _active={{
                  bg: 'fadebp',
                  color: 'white',
                }}
                isActive={showBackingTrack}
                onClick={() => {
                  setShowBackingTrack((prevState) => !prevState)
                }}
                size={'sm'}
                boxShadow="md"
                fontWeight={'normal'}
                px="3"
                py="4"
                mr={2}
                mt={useBreakpointValue({ base: 3, md: 2 })}
                leftIcon={<Icon as={FaPlayCircle} />}
              >
                Backing track
              </Button>
              <Button
                variant="outline"
                _hover={{
                  bg: 'twitter.400',
                  color: 'white',
                  opacity: showAutoscroll ? 0.8 : 1,
                }}
                _active={{
                  bg: 'fadebp',
                  color: 'white',
                }}
                isActive={showAutoscroll}
                onClick={() => {
                  setShowAutoscroll((prevState) => !prevState)
                }}
                size={'sm'}
                boxShadow="md"
                fontWeight={'normal'}
                px="3"
                py="4"
                mr={2}
                mt={useBreakpointValue({ base: 3, md: 2 })}
                leftIcon={<Icon as={FaCircleArrowDown} />}
              >
                Autoscroll
              </Button>
              <Menu>
                <MenuButton
                  as={Button}
                  variant="outline"
                  _hover={{
                    bg: 'twitter.300',
                    color: 'white',
                  }}
                  _active={{
                    bg: 'twitter.600',
                    color: 'white',
                  }}
                  size={'sm'}
                  boxShadow="md"
                  fontWeight={'normal'}
                  px="3"
                  py="4"
                  mt={useBreakpointValue({ base: 3, md: 2 })}
                  rightIcon={<ChevronDownIcon />}
                  leftIcon={<Icon fontSize={'sm'} as={MdFontDownload} />}
                >
                  Font size
                </MenuButton>
                <MenuList>
                  <MenuOptionGroup
                    value={tabFontSize.toString()}
                    onChange={(selectedSize: string) => {
                      setTabFontSize(parseInt(selectedSize))
                    }}
                  >
                    {fontSizeValues.map((size) => (
                      <MenuItemOption key={size} value={size.toString()}>
                        {size}%
                      </MenuItemOption>
                    ))}
                  </MenuOptionGroup>
                </MenuList>
              </Menu>
            </Flex>
          </Flex>
        </Skeleton>
      </Box>

      <Flex
        p={5}
        h="100%"
        w="100%"
        flexGrow={1}
        alignItems={'stretch'}
        wrap={'wrap'}
        justifyContent="center"
      >
        <Skeleton display={'flex'} w="100%" isLoaded={!isLoading}>
          <Flex
            h={'100%'}
            w="100%"
            fontSize={`${tabFontSize / 100}rem !important`}
          >
            {selectedTabContent && <TabRenderer tab={selectedTabContent.sheet!} transpose={transpose} />}
          </Flex>
        </Skeleton>
      </Flex>
      <ChordDiagram chords={chordsDiagrams} />
      <BackingtrackPlayer
        showBackingTrack={showBackingTrack}
        setShowBackingTrack={setShowBackingTrack}
        isLoading={isLoading}
        artist={selectedTabContent?.artist}
        songName={selectedTabContent?.name}
      />
      <Autoscroller
        showAutoscroll={showAutoscroll}
        isLoading={isLoading}
        bottomCSS={showBackingTrack ? '87px' : '17px'}
      />
    </>
  )
}


