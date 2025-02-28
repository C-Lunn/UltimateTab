import {
    Flex,
    Text, useBreakpointValue,
    Button, Fade,
    HStack,
    useColorModeValue,
    useRadioGroup,
    Menu,
    MenuButton,
    Icon,
    MenuList,
    MenuOptionGroup,
    MenuItemOption,
    Box,
    LinkBox,
    LinkOverlay,
    Badge,
    useToken,
    InputGroup,
    InputLeftElement,
    Input
} from '@chakra-ui/react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import useAppStateContext from '../hooks/useAppStateContext'
import useFavoriteTabs from '../hooks/useTabsFavorites'
import { TAB_SORT_TYPES, TAB_TYPES, TAB_TYPES_COLORS } from '../constants'
import RadioCard from '../components/RadioCard'
import { ChevronDownIcon, SearchIcon, StarIcon } from '@chakra-ui/icons'
import { MdFilterList } from 'react-icons/md'
import { useEffect, useRef, useState } from 'react'
import { Tab } from '../types/tabs'

export default function Favourites(): JSX.Element {
    const router = useRouter();
    const {
        searchType,
        favorites,
    } = useAppStateContext();

    const hexColors = useToken(
        'colors',
        Object.values(TAB_TYPES_COLORS).map((color) => color + '.300'),
    )

    const [filter_group, set_filter_group] = useState(TAB_TYPES.All);
    const [filter_string, set_filter_string] = useState("");
    const [sort_type, set_sort_type] = useState(TAB_SORT_TYPES.Default);
    const [sorted_favourites, set_sorted_favourites] = useState<Tab[]>([]);

    const borderLightColor = useColorModeValue('gray.200', 'gray.700')

    const { data: faves } = useFavoriteTabs(
        favorites,
        filter_string,
        filter_group,
        "artist,song",
    );

    const widthResult = useBreakpointValue({ base: '100%', md: 'sm' })
    const fontSizeHeading = useBreakpointValue({ base: 'md', md: 'lg' })
    const fontSizeContent = useBreakpointValue({ base: 'sm', md: 'md' })

    const { getRootProps, getRadioProps } = useRadioGroup({
        name: 'tabType',
        defaultValue: searchType,
        onChange: (value) => {
            set_filter_group(value);
        }
    });

    const group = getRootProps()

    const input_ref = useRef(null);

    useEffect(() => {
        const sorted = sort_favourites_by(faves?.results ?? [], sort_type);
        set_sorted_favourites(sorted);
    }, [faves, sort_type])


    return (
        <>
            <Head>
                <title>Favourites | Ultimate-Tab</title>
            </Head>

            <Fade style={{ display: 'flex', flexGrow: '1', flexDirection: 'column' }} in={true}>
                <Flex>
                    <HStack
                        mx={4}
                        pb={2}
                        w="100%"
                        borderBottomStyle={'solid'}
                        borderBottomWidth={'1px'}
                        borderBottomColor={borderLightColor}
                        flexWrap={'wrap'}
                        justifyContent="space-between"
                        {...group}
                    >
                        <HStack>
                            {Object.keys(TAB_TYPES).map((value) => {
                                const radio = getRadioProps({ value })
                                radio.isChecked = filter_group == value;
                                return (
                                    <RadioCard key={value} {...radio}>
                                        {value}
                                    </RadioCard>
                                )
                            })}

                            <InputGroup size={useBreakpointValue({ base: 'sm', md: 'md' })} mr={5} zIndex={1}>
                                <InputLeftElement
                                    h={'100%'}
                                    cursor={'pointer'}
                                >
                                    <SearchIcon color="gray.300" />
                                </InputLeftElement>
                                <Input
                                    ref={input_ref}
                                    onChange={(e) => {
                                        set_filter_string(e.target.value);
                                    }}
                                    placeholder="Filter favourites..."
                                    bg={'var(--chakra-colors-chakra-body-bg)'}
                                    value={filter_string}
                                    type={'text'}
                                />
                            </InputGroup>
                        </HStack>
                        <HStack marginInlineStart={'0 !important'} py={3}>
                            <Menu closeOnSelect={false}>
                                <MenuButton
                                    as={Button}
                                    variant="outline"
                                    _hover={{
                                        bg: 'twitter.400',
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
                                    rightIcon={<ChevronDownIcon />}
                                    leftIcon={
                                        <Icon
                                            fontSize={'sm'}
                                            color={useColorModeValue('gray.700', 'gray.200')}
                                            position="relative"
                                            top="-0.05rem"
                                            as={MdFilterList}
                                        />
                                    }
                                >
                                    Sort
                                </MenuButton>
                                <MenuList minWidth="240px">
                                    <MenuOptionGroup
                                        title="Sort By"
                                        type="radio"
                                        onChange={(v) => {
                                            console.log("setting sort type to", v)
                                            set_sort_type(v as unknown as string); // https://github.com/chakra-ui/chakra-ui/issues/8157
                                        }}
                                        value={sort_type}
                                    >
                                        {Object.keys(TAB_SORT_TYPES).map((key) => (
                                            <MenuItemOption
                                                key={TAB_SORT_TYPES[key]}
                                                value={TAB_SORT_TYPES[key]}
                                            >
                                                {key}
                                            </MenuItemOption>
                                        ))}
                                    </MenuOptionGroup>
                                </MenuList>
                            </Menu>
                        </HStack>
                    </HStack>
                </Flex>
                <Box px="2" py={3} overflowY={'auto'}>
                    <Flex wrap={'wrap'} justifyContent="center">
                        {sorted_favourites.map((tab, index) => (
                            <LinkBox
                                className="tab-result"
                                key={index}
                                onClick={() => {
                                    router.push(`/tab/${tab.slug}`)
                                    window.scrollTo(0, 0)
                                }}
                                as="div"
                                p="5"
                                m="2"
                                cursor={'pointer'}
                                width={widthResult}
                                borderWidth="1px"
                                rounded="md"
                                display={'flex'}
                                flexGrow={'1'}
                                fontSize={fontSizeContent}
                                justifyContent={'space-between'}
                                alignItems="center"
                                boxShadow="md"
                                style={{
                                    boxShadow: `${hexColors[Object.keys(TAB_TYPES_COLORS).indexOf(tab.type)]
                                        }5c 0px 4px 6px -1px, ${hexColors[Object.keys(TAB_TYPES_COLORS).indexOf(tab.type)]
                                        }5c 0px 2px 4px -1px`,
                                }}
                                _hover={{
                                    bg: `${TAB_TYPES_COLORS[tab.type]}.600`,
                                    color: 'white',
                                }}
                                transition="background-color 0.2s ease 0s"
                            >
                                <LinkOverlay>
                                    <Text fontSize={fontSizeHeading} as="b">
                                        {tab.artist}
                                    </Text>
                                    <br /> {tab.name}
                                </LinkOverlay>
                                <Box
                                    display={'flex'}
                                    alignItems={'center'}
                                    whiteSpace={'pre'}
                                    ml={2}
                                >
                                    {tab.type && TAB_TYPES_COLORS[tab.type] && (
                                        <Badge mr={2} colorScheme={TAB_TYPES_COLORS[tab.type]}>
                                            {tab.type.replace('Tabs', 'Tab')}
                                        </Badge>
                                    )}
                                    <StarIcon color={'yellow.400'} mr={'5px'} /> {tab.rating} (
                                    {tab.numberRates})
                                </Box>
                            </LinkBox>
                        ))}
                    </Flex>
                </Box>
            </Fade>
        </>
    )

}

function sort_favourites_by(favs: Tab[], sort_type: string): Tab[] {
    if (sort_type == "default") return favs;
    const sorted_array = [...favs]
    sorted_array.sort((a, b) => {
        switch(sort_type) {
            case "artist":
                return a.artist.localeCompare(b.artist)
            case "name":
                return a.name.localeCompare(b.name)
            case "date_added":
                return (a.date_added! >= b.date_added! ? 1 : -1)
            default:
                throw new Error("Invalid sort type")
        }
    })
    return sorted_array
}
