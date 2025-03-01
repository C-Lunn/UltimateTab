import { useEffect, useRef, useState } from 'react'
import TabPanel from '../../components/TabPanel'
import Head from 'next/head'
import useAppStateContext from '../../hooks/useAppStateContext'
import { Tab } from '../../types/tabs'
import { useRouter } from 'next/router'
import { Fade, useToast } from '@chakra-ui/react'
import TabView from '../../components/TabView'
import { UG_TABS_URL } from '../../constants'

export default function TabPage(): JSX.Element {
  const router = useRouter()
  const path = Array.isArray(router.query.path)
    ? router.query.path.join('/')
    : router.query.path

  const {
    favorites,
    selectedTab,
    setSelectedTab,
    isLoadingTab,
    selectedTabContent,
    handleClickFavorite,
    refetchTab,
    isLoadingTabBackground,
    selectedTabContentBackground,
  } = useAppStateContext()

  const toast = useToast()

  const title = selectedTabContent
    ? `${selectedTabContent.name} by ${selectedTabContent.artist} - Ultimate Tab`
    : 'Tab - Ultimate Tab'

  const [updatedResponsiveTab, setUpdatedResponsiveTab] =
    useState<Tab>(selectedTabContent)

  useEffect(() => {
    if (path) {
      setSelectedTab((prevState) => ({
        ...prevState,
        url: `${UG_TABS_URL}/tab/${path}`,
      }))
    }
  }, [path, setSelectedTab])

  useEffect(() => {
    if (!isLoadingTab) {
      if (!isLoadingTabBackground) {
        if (typeof selectedTabContentBackground !== 'undefined') {
          setUpdatedResponsiveTab(selectedTabContentBackground)
        }
      }
    }
  }, [
    selectedTabContentBackground,
    isLoadingTabBackground,
    toast,
    isLoadingTab,
  ])

  useEffect(() => {
    setUpdatedResponsiveTab(selectedTabContent)
  }, [selectedTabContent])


  useEffect(() => {
    // Add a listener for pgup and pagedown
    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [])

  const last_scroll_el = useRef<HTMLElement>(null);


  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'PageUp' || e.key === 'PageDown') {
      e.preventDefault();
      if (e.key === 'PageUp') {
        // Find tabgroup element at the TOP of the viewport and scroll it to the bottom (or page top)
        const elements = document.querySelectorAll('.tabrender-group');
        for (let i = 0; i < elements.length; i++) {
          const el = elements[i];
          let rect = el.getBoundingClientRect();
          if (rect.top > 0) {
            // get the previous element and scroll to that
            if (i < elements.length - 2) {
              const nextEl = elements[i + 2];
              rect = nextEl.getBoundingClientRect();
              nextEl.scrollIntoView({ behavior: 'smooth', block: "end", inline: "nearest" });
              // place a red triangle to the left of the element pointing at it
              const elToHighlight = elements[i + 1];
              if (last_scroll_el.current) {
                last_scroll_el.current.style.removeProperty("border-left");
              }
              last_scroll_el.current = elToHighlight as HTMLElement;
              last_scroll_el.current.style.borderLeft = "5px solid red";

            }
            return;
          }
        }
      } else if (e.key === 'PageDown') {
        // Find tabgroup element at the BOTTOM of the viewport and scroll it to the top (or page bottom)
        const elements = document.querySelectorAll('.tabrender-group');
        for (let i = 0; i < elements.length; i++) {
          const el = elements[i];
          let rect = el.getBoundingClientRect();
          if (rect.bottom > window.innerHeight) {
            // get the previous element and scroll to that
            if (i > 1) {
              const prevEl = elements[i - 2];
              rect = prevEl.getBoundingClientRect();
              prevEl.scrollIntoView({ behavior: 'smooth' });
              const elToHighlight = elements[i - 1];
              if (last_scroll_el.current) {
                last_scroll_el.current.style.removeProperty("border-left");
              }
              last_scroll_el.current = elToHighlight as HTMLElement;
              last_scroll_el.current.style.borderLeft = "5px solid red";

            }
            return;
          }
        }
      }
    }
  }

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <Fade
        style={{ display: 'flex', flexGrow: '1', flexDirection: 'column' }}
        in={true}
      >
        <TabView
          isLoading={isLoadingTab || selectedTab.url == '' ? true : false}
          selectedTab={selectedTab}
          selectedTabContent={updatedResponsiveTab}
          isFavorite={
            typeof favorites.find((el: Tab) => el.url === selectedTab.url) !==
            'undefined'
          }
          handleClickFavorite={handleClickFavorite}
          refetchTab={refetchTab}
        />
      </Fade>
    </>
  )
}
