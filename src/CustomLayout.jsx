/* eslint-disable no-console */
import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import * as ParagonIcons from '@openedx/paragon/icons';
// import {
//   Analytics,
//   Assignment,
//   Assistant,
//   Calendar,
//   FolderShared,
//   Home,
//   LibraryAdd,
//   LibraryBooks,
//   Lightbulb,
//   LmsBook,
// } from '@openedx/paragon/icons';
// import Sidebar from 'library/Sidebar/Sidebar';
import { MainHeader, Sidebar, SidebarProvider } from 'titaned-frontend-library';
import customGetUserMenuItems from '@src/library/utils/customGetUserMenuItems';
// import MainHeader from 'library/Header/MainHeader';
// import { SidebarProvider } from 'library/providers/SidebarProvider';
// import { FooterProps } './studio-home/interfaces/components';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import customMessages from './customMessages';
import { useContentSearchConnection } from './search-manager/data/apiHooks';
import { SearchContextProvider } from './search-manager';
import { LoadingSpinner } from './generic/Loading';
import HeaderExtras, { headerUser } from './customHeaderExtras';
import { fetchSiteFeatures } from './useSiteFeatures';

// Custom UI styles load after the stock Verawood styles (as in the previous
// version), so on equal specificity the custom rules win.
import('titaned-frontend-library/dist/index.css');
import('./styles/styles-overrides.scss');
import('./styles/custom-layout.scss');

// Design tokens for the custom UI are scoped to this class
// (tels-brand-openedx paragon/custom_authoring.scss).
const CUSTOM_UI_CLASS = 'tels-custom-authoring';
// import FeedbackComponent from './feedback/FeedbackComponent';
// import FeedbackLink from './feedbackBanner/FeedbackLink';

// Icon mapping for API icon names
// const iconMap = {
//   Analytics: <Analytics />,
//   Assignment: <Assignment />,
//   Assistant: <Assistant />,
//   Calendar: <Calendar />,
//   FolderShared: <FolderShared />,
//   LibraryAdd: <LibraryAdd />,
//   LibraryBooks: <LibraryBooks />,
//   Lightbulb: <Lightbulb />,
//   LmsBook: <LmsBook />,
// };

// API to fetch sidebar items
const fetchNavigationItems = async () => {
  try {
    const response = await getAuthenticatedHttpClient().get(
      `${getConfig().STUDIO_BASE_URL}/titaned/api/v1/menu-config/`,
    );
    // for local api fetch
    // const response = await getAuthenticatedHttpClient().get(
    //   'LMS_API_DOMAIN/titaned/api/v1/menu-config/'
    // );

    if (response.status !== 200) {
      throw new Error('Failed to fetch Navigation Items');
    }

    return response.data;
  } catch (error) {
    console.warn('Failed to fetch navigation items, using defaults:', error);
    // Return default values when API fails
    return {
      allow_to_create_new_course: false,
      show_class_planner: false,
      show_insights_and_reports: false,
      assistant_is_enabled: false,
      resources_is_enabled: false,
      enable_search_in_header: false,
      enabled_re_sync: false,
      enable_switch_to_learner: false,
      enable_help_center: false,
      language_selector_is_enabled: false,
      notification_is_enabled: false,
      enabled_languages: [],
    };
  }
};

const CustomLayout = () => {
  const intl = useIntl();
  useEffect(() => {
    document.documentElement.classList.add(CUSTOM_UI_CLASS);
    document.body.classList.add(CUSTOM_UI_CLASS);
    return () => {
      document.documentElement.classList.remove(CUSTOM_UI_CLASS);
      document.body.classList.remove(CUSTOM_UI_CLASS);
    };
  }, []);

  // const [templateData, setTemplateData] = useState<TemplateData | undefined>(undefined)
  // const [headerData, setHeaderData] = useState(undefined);
  // const [footerData, setFooterData] = useState(undefined);

  const [userMenuItemsFromAPI, setUserMenuItemsFromAPI] = useState({});

  const { authenticatedUser, config } = useContext(AppContext);
  const { LOGOUT_URL } = config;
  const userIsAdmin = authenticatedUser.administrator;

  useEffect(() => {
    const fetchUserMenuItemsFromAPI = async () => {
      try {
        const response = await getAuthenticatedHttpClient().get(
          `${getConfig().LMS_BASE_URL}/titaned/api/v1/user-dropdown-menu/`,
        );
        // const response = await getAuthenticatedHttpClient().get('LMS_API_DOMAIN/titaned/api/v1/user-dropdown-menu/');
        const { data } = response;
        if (data) {
          setUserMenuItemsFromAPI(data);
        } else {
          setUserMenuItemsFromAPI({});
        }
      } catch (error) {
        console.error('Error fetching user menu items:', error);
        setUserMenuItemsFromAPI({});
      }
    };
    fetchUserMenuItemsFromAPI();
  }, []);

  // Full name and profile picture, as the header shows them (customHeaderExtras.jsx).
  const updatedAuthenticatedUser = headerUser(authenticatedUser, userMenuItemsFromAPI);

  const userMenuItems = customGetUserMenuItems({
    intl,
    logoutUrl: LOGOUT_URL,
    userMenuItemsFromAPI,
    isAdmin: userIsAdmin,
  });

  const navigate = useNavigate();
  const location = useLocation();

  const presentPath = location.pathname;

  // Sidebar items state
  const [sidebarItems, setSidebarItems] = useState([
    {
      label: intl.formatMessage(customMessages.sidebarDashboardTitle),
      path: '/home',
      icon: <ParagonIcons.Home />,
    },
  ]);
  const [loadingSidebar, setLoadingSidebar] = useState(true);
  const [headerButtons, setHeaderButtons] = useState({});
  const [languageSelectorList, setLanguageSelectorList] = useState([]);
  const [isSearchEnabled, setIsSearchEnabled] = useState(false);
  // const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // const DefaultIcon = ParagonIcons.Home;

  // useEffect(() => {
  //   let isMounted = true;
  //   fetchSidebarItems().then((apiItems) => {
  //     if (isMounted) {
  //       const formattedApiItems = apiItems.map(item => ({
  //         label: item.label,
  //         path: item.path,
  //         icon: iconMap[item.iconName] || null,
  //       }));
  //       setSidebarItems(prev => [prev[0], ...formattedApiItems]);
  //       setLoadingSidebar(false);
  //     }
  //   });
  //   return () => { isMounted = false; };
  // }, [intl]);

  useEffect(() => {
    let isMounted = true;

    const fetchMenu = async () => {
      try {
        const [menuConfig, siteFeatures] = await Promise.all([fetchNavigationItems(), fetchSiteFeatures()]);

        setIsSearchEnabled(menuConfig.enable_search_in_header);

        if (isMounted && menuConfig) {
          // Define all sidebar items with their visibility conditions
          const sidebarItemsConfig = [
            {
              label: intl.formatMessage(customMessages.sidebarDashboardTitle),
              path: '/home',
              icon: <ParagonIcons.Home />,
              isVisible: true, // Always visible
            },
            {
              label: intl.formatMessage(customMessages.sidebarCreateNewCourseTitle),
              path: '/new-course',
              icon: <ParagonIcons.LibraryAdd />,
              isVisible: menuConfig.allow_to_create_new_course || false,
            },
            {
              label: intl.formatMessage(customMessages.sidebarMyCoursesTitle),
              path: '/my-courses',
              icon: <ParagonIcons.LmsBook />,
              isVisible: true, // Always visible
            },
            {
              label: intl.formatMessage(customMessages.sidebarMyAssessmentsTitle),
              path: '/assessments',
              icon: <ParagonIcons.FactCheck />,
              // A feature a site may not have (useSiteFeatures.js).
              isVisible: Boolean(siteFeatures.assessment_center),
            },
            {
              label: intl.formatMessage(customMessages.sidebarMyMeetingsTitle),
              path: '/meetings',
              icon: <ParagonIcons.VideoCall />,
              // Live classes with Zoom: a feature a site may not have (useSiteFeatures.js).
              isVisible: Boolean(siteFeatures.zoom_integration),
            },
            {
              label: intl.formatMessage(customMessages.sidebarContentLibrariesTitle),
              path: '/libraries',
              icon: <ParagonIcons.LibraryBooks />,
              isVisible: true, // Always visible
            },
            {
              label: intl.formatMessage(customMessages.sidebarCalendarTitle),
              path: '/calendar',
              icon: <ParagonIcons.Calendar />,
              // The sold feature "Calendar": a feature a site may not have (useSiteFeatures.js).
              isVisible: Boolean(siteFeatures.calendar),
            },
            {
              label: intl.formatMessage(customMessages.sidebarClassPlannerTitle),
              path: '/class-planner',
              icon: <ParagonIcons.Analytics />,
              isVisible: menuConfig.show_class_planner || false,
            },
            {
              label: intl.formatMessage(customMessages.sidebarInsightsReportsTitle),
              path: '/reports',
              icon: <ParagonIcons.Lightbulb />,
              isVisible: menuConfig.show_insights_and_reports || false,
            },
            {
              label: intl.formatMessage(customMessages.sidebarTitanAITitle),
              path: '/ai-assistant',
              icon: <ParagonIcons.Assistant />,
              isVisible: menuConfig.assistant_is_enabled || false,
            },
            {
              label: intl.formatMessage(customMessages.sidebarSharedResourcesTitle),
              path: '/shared-resources',
              icon: <ParagonIcons.FolderShared />,
              isVisible: menuConfig.resources_is_enabled || false,
            },
            {
              label: intl.formatMessage(customMessages.sidebarTaxonomiesTitle),
              path: '/taxonomies',
              icon: <ParagonIcons.Assignment />,
              isVisible: true, // Always visible
            },
            {
              label: intl.formatMessage(customMessages.sidebarAssignmentsTitle),
              path: '/assignments',
              icon: <ParagonIcons.Assignment />,
              isVisible: menuConfig.enable_assignments || false,
            },
          ];

          // Filter visible items and remove the isVisible property
          const visibleSidebarItems = sidebarItemsConfig
            .filter(item => item.isVisible)
            .map(({ isVisible, ...item }) => item);

          setSidebarItems(visibleSidebarItems);

          const headerButtonsConfig = {
            reSync: menuConfig.enabled_re_sync || false,
            contextSwitcher: menuConfig.enable_switch_to_learner || false,
            help: menuConfig.enable_help_center || false,
            translation: menuConfig.language_selector_is_enabled || false,
            notification: menuConfig.notification_is_enabled || false,
          };

          setHeaderButtons(headerButtonsConfig);

          if (menuConfig.enabled_languages) {
            setLanguageSelectorList(menuConfig.enabled_languages);
          }
        }
      } catch {
        // Fallback to always-visible items when API fails
        const fallbackItems = [
          {
            label: intl.formatMessage(customMessages.sidebarDashboardTitle),
            path: '/home',
            icon: <ParagonIcons.Home />,
            isVisible: true,
          },
          {
            label: intl.formatMessage(customMessages.sidebarCreateNewCourseTitle),
            path: '/new-course',
            icon: <ParagonIcons.LibraryAdd />,
            isVisible: false, // Hide when API fails
          },
          {
            label: intl.formatMessage(customMessages.sidebarMyCoursesTitle),
            path: '/my-courses',
            icon: <ParagonIcons.LmsBook />,
            isVisible: true,
          },
          {
            label: intl.formatMessage(customMessages.sidebarMyAssessmentsTitle),
            path: '/assessments',
            icon: <ParagonIcons.FactCheck />,
            // Not known without the API: a feature is not shown on a guess.
            isVisible: false,
          },
          {
            label: intl.formatMessage(customMessages.sidebarMyMeetingsTitle),
            path: '/meetings',
            icon: <ParagonIcons.VideoCall />,
            isVisible: false,
          },
          {
            label: intl.formatMessage(customMessages.sidebarContentLibrariesTitle),
            path: '/libraries',
            icon: <ParagonIcons.LibraryBooks />,
            isVisible: true,
          },
          {
            label: intl.formatMessage(customMessages.sidebarCalendarTitle),
            path: '/calendar',
            icon: <ParagonIcons.Calendar />,
            isVisible: false,
          },
          {
            label: intl.formatMessage(customMessages.sidebarClassPlannerTitle),
            path: '/class-planner',
            icon: <ParagonIcons.Analytics />,
            isVisible: false, // Hide when API fails
          },
          {
            label: intl.formatMessage(customMessages.sidebarInsightsReportsTitle),
            path: '/reports',
            icon: <ParagonIcons.Lightbulb />,
            isVisible: false, // Hide when API fails
          },
          {
            label: intl.formatMessage(customMessages.sidebarTitanAITitle),
            path: '/ai-assistant',
            icon: <ParagonIcons.Assistant />,
            isVisible: false, // Hide when API fails
          },
          {
            label: intl.formatMessage(customMessages.sidebarSharedResourcesTitle),
            path: '/shared-resources',
            icon: <ParagonIcons.FolderShared />,
            isVisible: false, // Hide when API fails
          },
          {
            label: intl.formatMessage(customMessages.sidebarTaxonomiesTitle),
            path: '/taxonomies',
            icon: <ParagonIcons.Assignment />,
            isVisible: true,
          },
          {
            label: intl.formatMessage(customMessages.sidebarAssignmentsTitle),
            path: '/assignments',
            icon: <ParagonIcons.Assignment />,
            isVisible: true,
          },
        ];

        // Filter visible items and remove the isVisible property
        const visibleFallbackItems = fallbackItems
          .filter(item => item.isVisible)
          .map(({ isVisible, ...item }) => item);

        setSidebarItems(visibleFallbackItems);

        const fallbackHeaderButtonsConfig = {
          reSync: true,
          contextSwitcher: true,
          help: true,
          translation: false,
          notification: false,
        };

        setHeaderButtons(fallbackHeaderButtonsConfig);

        setLanguageSelectorList([]);
      } finally {
        setLoadingSidebar(false);
      }
    };

    fetchMenu();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
  };

  // useEffect(() => {
  //   const getTemplateData = async () => {
  //     try {
  //       const templateData = await fetchTemplateData();
  //       const header = templateData?.content?.header?.mainHeader;
  //       const footer = templateData?.content?.footer;
  //       setHeaderData(header);
  //       setFooterData(footer);
  //     } catch (error) {
  //       throw new Error(`Error fetching template data: ${error.message}`);
  //     }
  //   };

  //   getTemplateData();
  // }, []);

  // const sidebarItems = [
  //   { label: intl.formatMessage(customMessages.sidebarDashboardTitle), path: '/home', icon: <Home /> },
  //   { label: intl.formatMessage(customMessages.sidebarCreateNewCourseTitle), path: '/new-course', icon: <LibraryAdd /> },
  //   { label: intl.formatMessage(customMessages.sidebarMyCoursesTitle), path: '/my-courses', icon: <LmsBook /> },
  //   { label: intl.formatMessage(customMessages.sidebarContentLibrariesTitle), path: '/libraries', icon: <LibraryBooks /> },
  //   { label: intl.formatMessage(customMessages.sidebarCalendarTitle), path: '/calendar', icon: <Calendar /> },
  //   { label: intl.formatMessage(customMessages.sidebarClassPlannerTitle), path: '/class-planner', icon: <Analytics /> },
  //   { label: intl.formatMessage(customMessages.sidebarInsightsReportsTitle), path: '/reports', icon: <Lightbulb /> },
  //   { label: intl.formatMessage(customMessages.sidebarTitanAITitle), path: '/ai-assistant', icon: <Assistant /> },
  //   { label: intl.formatMessage(customMessages.sidebarSharedResourcesTitle),
  //     path: '/shared-resources', icon: <FolderShared /> },
  //   { label: intl.formatMessage(customMessages.sidebarTaxonomiesTitle), path: '/taxonomies', icon: <Assignment /> },
  // ];

  // const contactInfo = {
  //   align: 'left',
  //   content: {
  //     shortdesc: 'We are passionate education dedicated to
  // providing high-quality resources learners all backgrounds.',
  //     address1: 'Yarra Park, Melbourne, Australia',
  //     address2: '',
  //     pincode: '',
  //     location: {
  //       label: 'San fransicoq',
  //       value: 'Sanss',
  //     },
  //     phonenumber: '9515088071',
  //     facebook: '',
  //     instagram: '',
  //     twitter: '',
  //     linkedIn: '',
  //   },
  // };

  // const quickLinks = {
  //   align: 'center',
  //   content: [
  //     {
  //       label: 'Latest Courses',
  //       link: '',
  //     },
  //     {
  //       label: 'Mission & Vision',
  //       link: '',
  //     },
  //     {
  //       label: 'Join a Career',
  //       link: '',
  //     },
  //     {
  //       label: 'Zoom Meeting',
  //       link: '',
  //     },
  //     {
  //       label: 'Pricing Plan',
  //       link: '',
  //     },
  //   ],
  // };

  // const exploreLinks = {
  //   align: 'right',
  //   content: [
  //     {
  //       label: 'Course One',
  //       link: '',
  //     },
  //     {
  //       label: 'Course Two',
  //       link: '',
  //     },
  //     {
  //       label: 'Create Course',
  //       link: '',
  //     },
  //     {
  //       label: 'Lesson Details',
  //       link: '',
  //     },
  //     {
  //       label: 'Instructor',
  //       link: '',
  //     },
  //   ],
  // };

  // const headerButtons = {
  //   reSync: true,
  //   contextSwitcher: true,
  //   help: true,
  //   translation: true,
  //   notification: true,
  // };

  const handleLanguageChange = () => {
    window.location.reload();
  };

  const { client, indexName } = useContentSearchConnection();

  const meiliSearchConfig = {
    host: client?.config?.host,
    apiKey: client?.config?.apiKey,
    indexName,
    client, // 🔑 This is the key addition - pass the complete client
  };

  // Don't render SearchContextProvider if MeiliSearch is not ready and search is enabled
  if (isSearchEnabled && (!client || !indexName)) {
    return (
      <div className="d-flex justify-content-center align-items-center flex-column vh-100">
        <LoadingSpinner />
      </div>
    );
  }

  const renderContent = () => (
    <div className={`app-container ${CUSTOM_UI_CLASS}`}>
      {/* <p>This is header</p> */}
      <SidebarProvider>
        <div className="header-container">
          {/* <FeedbackLink isOpen={isFeedbackOpen} setIsOpen={setIsFeedbackOpen} /> */}
          <MainHeader
            logoUrl={config.LOGO_URL}
            // menuAlignment={headerData.menu.align}
            // menuList={headerData.menu.menuList}
            // loginSignupButtons={headerData.menu.loginSignupButtons}
            authenticatedUser={updatedAuthenticatedUser}
            userMenuItems={userMenuItems}
            onLanguageChange={handleLanguageChange}
            getBaseUrl={() => '/authoring'}
            headerButtons={headerButtons}
            meiliSearchConfig={isSearchEnabled ? meiliSearchConfig : null}
            languageSelectorList={languageSelectorList}
            // onSearchResults={(results) => {
            //   console.log('Search results:', results);
            // }}
          />
          <HeaderExtras />
        </div>
        {/* Sidebar and Main Content */}
        <div className="content-wrapper">
          <div className="sidebar-container">
            {loadingSidebar ?
              (
                <div className="d-flex justify-content-center align-items-center p-4">
                  <LoadingSpinner />
                </div>
              ) :
              (
                <Sidebar
                  buttons={sidebarItems}
                  onNavigate={handleNavigate}
                  presentPath={presentPath}
                />
              )}
          </div>
          <div className="main-content">
            <div className="page-content">
              <Outlet />
            </div>
          </div>
        </div>
        {
          /* <div>
          <div className="footer-container">
            <Footer
              contactInfo={contactInfo}
              quickLinks={quickLinks}
              exploreLinks={exploreLinks}
              logoUrl="https://titaned.com/wp-content/uploads/2023/07/TitanEdLogoHigherEdOrange.png"
              copyrights="Copyright © 2025 All Rights Reserved by TitanEd"
            />
          </div>
        </div> */
        }
      </SidebarProvider>
      {/* <FeedbackComponent isOpen={isFeedbackOpen} setIsOpen={setIsFeedbackOpen} /> */}
    </div>
  );

  return isSearchEnabled ?
    (
      <SearchContextProvider>
        {renderContent()}
      </SearchContextProvider>
    ) :
    (
      renderContent()
    );
};
export default CustomLayout;
