from tutor import hooks
from tutormfe.hooks import PLUGIN_SLOTS

hooks.Filters.ENV_PATCHES.add_item(
     (
         "mfe-env-config-runtime-definitions-authoring",
         """
        // This file contains configuration for plugins and environment variables.
const { PLUGIN_OPERATIONS, DIRECT_PLUGIN } = await import('@openedx/frontend-plugin-framework');
const { default: CourseNavigationSidebar } = await import('./src/shared-components/CourseNavigationSidebar');
const { default: CustomScheduleAndDetails } = await import('./src/CustomScheduleAndDetails');
const { default: messages } = await import('./src/schedule-and-details/messages');
const { Settings, DragHandle, SettingsApplications } = await import('@openedx/paragon/icons');
const {
  ActionRow, Button, Container, Dropdown, Icon, IconButton, Layout, ProgressBar, Stack,
} = await import('@openedx/paragon');
const { default: cardHeaderMessages } = await import('./src/course-outline/card-header/messages');
const { default: FormSwitchGroup } = await import('./src/generic/FormSwitchGroup');
const { default: StatusBarContent } = await import('./src/course-outline/status-bar/StatusBarContent');
const { default: CustomStatusBar } = await import('./src/course-outline/status-bar/CustomStatusBar');
const { default: SubHeader } = await import('./src/generic/sub-header/SubHeader');
const { default: CustomCourseUpdates } = await import('./src/course-updates/CustomCourseUpdates');
const { default: CustomCourseExportPage } = await import('./src/export-page/CustomCourseExportPage');
const { FormattedMessage, useIntl } = await import('@edx/frontend-platform/i18n');
const { default: WarningMessage } = await import('./src/generic/warning-message/WarningMessage');
const { default: SettingCard } = await import('./src/advanced-settings/setting-card/SettingCard');
const { default: CustomExportSidebar } = await import('/src/export-page/export-sidebar/CustomExportSidebar');
const { default: CourseChecklistCustom } = await import('./src/plugins-components/CourseChecklistCustom');
const { default: ChecklistItemBody } = await import('./src/course-checklist/ChecklistSection/ChecklistItemBody');
const { default: ChecklistItemComment } = await import('./src/course-checklist/ChecklistSection/ChecklistItemComment');
const { default: CustomFilesPage } = await import('./src/files-and-videos/files-page/CustomFilesPage');
const { default: CustomGalleryCard } = await import('./src/files-and-videos/generic/table-components/CustomGalleryCard');
const { default: CustomPagesAndResources } = await import('./src/pages-and-resources/CustomPagesAndResources');
const { default: CustomTextbooks } = await import('./src/textbooks/CustomTextbooks');
const { default: CustomPagesNew } = await import('./src/custom-pages/CustomPagesNew');
const { default: EditorPage } = await import('./src/editors/EditorPage');
const { default: CustomImportSidebar } = await import('/src/import-page/import-sidebar/CustomImportSidebar');
const { default: CustomCourseUpdate } = await import('./src/course-updates/course-update/CustomCourseUpdate');
const { default: CourseRerunForm } = await import('./src/course-rerun/course-rerun-form');
const { default: CourseRerunSideBar } = await import('./src/course-rerun/course-rerun-sidebar');
const { default: CustomCreateLibrary } = await import('./src/library-authoring/create-library/CustomCreateLibrary');
const { default: CustomLibrariesV2 } = await import('./src/studio-home/tabs-section/libraries-v2-tab/CustomLibrariesV2');
const { default: CustomLibraryAuthoringPage } = await import('./src/library-authoring/CustomLibraryAuthoringPage');
const { default: CustomLibraryCollectionPage } = await import('./src/library-authoring/collections/CustomLibraryCollectionPage');
const { default: CustomTaxonomyListPage } = await import('./src/taxonomy/CustomTaxonomyListPage');
const { default: CustomTaxonomyDetailPage } = await import('./src/taxonomy/taxonomy-detail/CustomTaxonomyDetailPage');
const { default: FileSection } = await import('./src/import-page/file-section/FileSection');
const { default: ImportStepper } = await import('./src/import-page/import-stepper/ImportStepper');
const { default: CustomAdvancedSettingsHeader } = await import('./src/advanced-settings/CustomAdvancedSettingsHeader');
const { default: CustomAppRoutes } = await import('./src/CustomAppRoutes');
const { default: CustomXBlockStatus } = await import('./src/course-outline/xblock-status/CustomXBlockStatus');
const { default: CustomBasicTab } = await import('./src/generic/configure-modal/CustomBasicTab');
const { default: CustomOutlineSidebar } = await import('./src/course-outline/outline-sidebar/CustomOutlineSidebar');

{% raw %}

const getPluginSlots = () => {
return {

    app_layout_plugin_slot: {
      keepDefault: false,
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Hide,
          widgetId: 'default_contents',
        },
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'custom_app_layout',
            type: DIRECT_PLUGIN,
            priority: 1,
            RenderWidget: () => <CustomAppRoutes />,
          },
        },
      ],
    },
        // Stock status bar under the page title: the custom one sits in view_live_button_slot.
        status_bar_plugin_slot: {
            keepDefault: false,
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Hide,
                    widgetId: 'default_contents',
                },
            ],
        },
        // Course outline info sidebar: closed by default (custom copy).
        'org.openedx.frontend.authoring.course_outline_sidebar.v1': {
            keepDefault: false,
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Hide,
                    widgetId: 'default_contents',
                },
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: 'custom_course_outline_sidebar',
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: () => <CustomOutlineSidebar />,
                    },
                },
            ],
        },
        xblock_status_plugin_slot: {
            keepDefault: false,
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Hide,
                    widgetId: 'default_contents',
                },
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: 'custom_xblock_status',
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: (props) => <CustomXBlockStatus {...props} />,
                    },
                },
            ],
        },
        configure_modal_basic_tab_plugin_slot: {
            keepDefault: false,
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Hide,
                    widgetId: 'default_contents',
                },
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: 'custom_basic_tab',
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: (props) => <CustomBasicTab {...props} />,
                    },
                },
            ],
        },
        header_plugin_slot: {
            keepDefault: false,
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Hide,
                    widgetId: 'default_contents',
                },
            ],
        },
        footer_plugin_slot: { // New slot for the footer
            keepDefault: false,
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Hide,
                    widgetId: 'default_contents',
                },
            ],
        },
        course_sidebar_plugin_slot: { // Use the standard plugin structure
            keepDefault: false,
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert, // Operation to insert the widget
                    widget: {
                        id: 'course-nav-bar',
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        // Accept and forward all props for dynamic support
                        RenderWidget: (props) => <CourseNavigationSidebar {...props} />,
                    },
                },
            ],
        },
        card_header_menu_icon_plugin_slot: {
            keepDefault: false,
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: 'card-header-menu-icon',
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: ({ namePrefix }) => {
                          const intl = useIntl();
                          return (
                            <Dropdown.Toggle
                                className="item-card-header__menu"
                                id={`${namePrefix}-card-header__menu`}
                                data-testid={`${namePrefix}-card-header__menu-button`}
                                as={IconButton}
                                src={Settings}
                                alt={intl.formatMessage(cardHeaderMessages.menuButtonAlt)}
                                iconAs={Icon}
                            />
                          );
                        },
                    },
                },
            ],
        },
        drag_indicator_icon_plugin_slot: {
            keepDefault: false,
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: 'drag-indicator-icon',
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: () => <Icon src={DragHandle} className="btn-icon-secondary" />,
                    },
                },
            ],
        },
        schedule_and_details_plugin_slot: {
            keepDefault: false,
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: 'custom-schedule-details',
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: (props) => <CustomScheduleAndDetails {...props} messages={messages} />,
                    },
                },
            ],
        },
        sub_header_plugin_slot: {
            keepDefault: false,
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Hide,
                    widgetId: 'default_contents',
                },
            ],
        },
        statusbar_content_plugin_slot: {
            keepDefault: false,
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: 'statusbar-content',
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: (pluginProps) => {
                            const {
                                onAddSection,
                                onCollapseAll,
                                isSectionsExpanded,
                                handleExpandAll,
                                headerActions,
                            } = pluginProps || {};
                            return (
                                <StatusBarContent
                                    onAddSection={onAddSection}
                                    onCollapseAll={onCollapseAll}
                                    isSectionsExpanded={isSectionsExpanded}
                                    handleExpandAll={handleExpandAll}
                                    headerActions={headerActions}
                                />
                            );
                        },
                    },
                }
            ],
        },
        view_live_button_slot: {
            keepDefault: false,
            plugins: [{
                op: PLUGIN_OPERATIONS.Insert,
                widget: {
                    id: 'statusbar-with-view-live',
                    type: DIRECT_PLUGIN,
                    priority: 1,
                    RenderWidget: (props) => (
                        <div className="viewLiveDiv">
                            <CustomStatusBar
                                className="viewLiveCustom"
                                courseId={props.courseId}
                                isLoading={props.isLoading}
                                statusBarData={props.statusBarData}
                                openEnableHighlightsModal={props.openEnableHighlightsModal}
                                handleVideoSharingOptionChange={props.handleVideoSharingOptionChange}
                            />
                        </div>
                    ),
                },
            }]
        },

        course_team_header_plugin_slot: {
            keepDefault: false,
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: "course-team-content",
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: (props) => (
                            <div className="course-team-custom-header">
                                <div className="course-team-custom-sub-header">
                                    <span>{props.contentTitle}</span>
                                    <SubHeader
                                        headerActions={props.isAllowActions && (
                                            <Button
                                                variant="primary"
                                                iconBefore={props.iconBefore}
                                                size="sm"
                                                onClick={props.onClick}
                                                disabled={props.disabled}
                                            >
                                                {props.buttonText}
                                            </Button>
                                        )}
                                    />
                                </div>
                                <hr className='customHr' />
                            </div>
                        ),
                    },
                }
            ],
        },

        advanced_settings_header_plugin_slot: {
            keepDefault: false,
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: "advanced_settings_header_plugin_slot",
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: (props) => (
                            <CustomAdvancedSettingsHeader {...props} />
                        ),
                    },
                }
            ],
        },

        advanced_settings_card_plugin_slot: {
            keepDefault: false,
            plugins: [
              {
                op: PLUGIN_OPERATIONS.Insert,
                widget: {
                  id: "my-advanced-settings-card",
                  type: DIRECT_PLUGIN,
                  priority: 1,
                  RenderWidget: (props) => (
                    <div className={`custom-setting-card ${props.settingData?.deprecated ? 'show-deprecated-style' : ''}`}>
                        <SettingCard {...props} />
                        {props.settingData?.deprecated && (
                            <span className="deprecated-label">
                                <FormattedMessage
                                    id="course-authoring.advanced-settings.custom.deprecated-label"
                                    defaultMessage="Deprecated"
                                    description="Badge on an advanced setting that is deprecated"
                                />
                            </span>
                        )}
                    </div>
                  ),
                },
              },
            ],
        },

        advanced_settings_header_removal_plugin_slot: {
            keepDefault: false,
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Hide,
                }
            ],
        },

        certificates_header_plugin_slot: {
            keepDefault: false,
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: "certificates-content",
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: (props) => (
                            <div className="certificates-custom-header">
                                <div className="certificates-custom-sub-header">
                                    <div className="certificates-custom-sub-header-title">
                                        <SubHeader
                                            title={props.title}
                                            headerActions={props.headerActions}
                                        />
                                    </div>
                                </div>
                                
                                <hr className='customHr' />

                            </div>
                        ),
                    },
                }
            ],
        },

        certificates_header_hide_plugin_slot: {
            keepDefault: false,
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Hide,
                }
            ],
        },

        course_checklist_plugin_slot: {
            keepDefault: false,
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: "course-checklist-content",
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: (props) => (
                            <CourseChecklistCustom {...props} />
                        ),
                    },
                }
            ],
        },

        course_checklist_section_title_plugin_slot: {
            keepDefault: false,
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: "course-checklist-section-title",
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: (props) => (
                            <div className="custom-checklist-section-title-container">
                                <div className="custom-checklist-section-title">
                                    <h3 aria-describedby={props.getCompletionCountID()} className="lead">{props.dataHeading}</h3>
                                    <div data-testid="completion-subheader">
                                        {props.getCompletionCount(props.checks, props.totalCompletedChecks)}
                                    </div>
                                </div>
                                <ProgressBar
                                        now={(props.totalCompletedChecks / (props.checks?.length || 1)) * 100}
                                        // srOnlyText={`${props.totalCompletedChecks} of ${props.checks?.length || 1} completed`}
                                        className="custom-checklist-section-progress-bar"
                                    />
                            </div>
                        ),
                    },
                }
            ],
        },

        course_checklist_section_completion_subheader_plugin_slot: {
            keepDefault: false,
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Hide,
                }
            ]
        },

        course_checklist_section_checklist_item_plugin_slot: {
            keepDefault: false,
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: "course-checklist-section-checklist-item",
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: (props) => (
                            <div
                                className={`checklist-item-card border py-3 px-4 ${props.isCompleted && 'checklist-item-complete'}`}
                                id={`checklist-item-${props.checkId}`}
                                data-testid={`checklist-item-${props.checkId}`}
                                key={props.checkId}
                            >
                                <ChecklistItemBody {...{ courseId: props.courseId, checkId: props.checkId, isCompleted: props.isCompleted, updateLink: props.updateLink }} />
                                <div data-testid={`comment-section-${props.checkId}`}>
                                    <ChecklistItemComment {...{ courseId: props.courseId, checkId: props.checkId, outlineUrl: props.outlineUrl, data: props.data }} />
                                </div>
                            </div>
                        )
                    }
                }
            ]
        },

        create_library_plugin_slot: {
            keepDefault: false,
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: "create-library-content",
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: (props) => (
                            <CustomCreateLibrary {...props} />
                        ),
                    },
                }
            ],
        },

        libraries_v2_plugin_slot: {
            keepDefault: false,
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: "libraries-v2-content",
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: (props) => (
                            <CustomLibrariesV2 {...props} />
                        ),
                    },
                }
            ],
        },

        // The library page in TELS' layout. The stock page stays for the picker that searches
        // every library at once ("Add existing" in the course outline): it has no library data.
        library_authoring_page_plugin_slot: {
            keepDefault: true,
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Wrap,
                    widgetId: "default_contents",
                    wrapper: ({ component, pluginProps }) => (
                        pluginProps.libraryData
                            ? <CustomLibraryAuthoringPage {...pluginProps} />
                            : component
                    ),
                }
            ],
        },

        library_authoring_collection_page_plugin_slot: {
            keepDefault: false,
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: "library-authoring-collection-page-content",
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: (props) => (
                            <CustomLibraryCollectionPage {...props} />
                        ),
                    },
                }
            ],
        },

        course_rerun_header_plugin_slot: {
            keepDefault: false,
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Hide,
                    widgetId: 'default_contents'
                }
            ]
        },

        course_rerun_footer_plugin_slot: {
            keepDefault: false,
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Hide,
                    widgetId: 'default_contents'
                }
            ]
        },

        course_rerun_content_plugin_slot: {
            keepDefault: false,
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: "course-rerun-content-content",
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: (props) => (
                            <Container size="xl" className="small p-4 mt-3">
                                <section >
                                    <Layout
                                        lg={[{ span: 9 }, { span: 3 }]}
                                        md={[{ span: 9 }, { span: 3 }]}
                                        sm={[{ span: 9 }, { span: 3 }]}
                                        xs={[{ span: 9 }, { span: 3 }]}
                                        xl={[{ span: 9 }, { span: 3 }]}
                                    >
                                        <Layout.Element>
                                            <div className='course-rerun-content'>
                                                <section>
                                                    <header className="d-flex">
                                                        <Stack>
                                                            <h2>
                                                                {props.rerunTitle} {props.displayName}
                                                            </h2>
                                                            <span className="large">{props.originalCourseData}</span>
                                                        </Stack>
                                                        <ActionRow className="ml-auto">
                                                            <Button variant="outline-primary" size="sm" onClick={props.cancelButtonClick}>
                                                                {props.cancelButton}
                                                            </Button>
                                                        </ActionRow>
                                                    </header>
                                                    <hr className='customHr' />
                                                </section>

                                                <div className='course-rerun-form'>
                                                    <CourseRerunForm
                                                        initialFormValues={props.initialFormValues}
                                                        onClickCancel={props.handleRerunCourseCancel}
                                                    />
                                                </div>

                                            </div>
                                        </Layout.Element>
                                        <Layout.Element>
                                            <CourseRerunSideBar />
                                        </Layout.Element>
                                    </Layout>
                                </section>
                            </Container>
                        ),
                    }
                }
            ]
        },

        taxonomy_list_page_plugin_slot: {
            keepDefault: false,
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: "taxonomy-list-page-content",
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: (props) => (
                            <CustomTaxonomyListPage {...props} />
                        ),
                    },
                }
            ],
        },

        taxonomy_detail_page_plugin_slot: {
            keepDefault: false,
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: "taxonomy-detail-page-content",
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: (props) => (
                            <CustomTaxonomyDetailPage {...props} />
                        ),
                    },
                }
            ],
        },

        grading_header_plugin_slot: {
            keepDefault: false,
            plugins: [
                {
                op: PLUGIN_OPERATIONS.Insert,
                widget: {
                    id: "grading-content",
                    type: DIRECT_PLUGIN,
                    priority: 1,
                    RenderWidget: (props) => (
                        <div>
                            <SubHeader
                            contentTitle={props.contentTitle}
                            description={props.description}
                            />
                            <span className="grading-sub-header"></span>
                        </div>
                    ),
                },
                },
            ],
        },
        course_updates_plugin_slot: {
            keepDefault: false,
            plugins: [
                {
                op: PLUGIN_OPERATIONS.Insert,
                widget: {
                    id: "course_updates",
                    type: DIRECT_PLUGIN,
                    priority: 1,
                    RenderWidget: (props) => 
                        <CustomCourseUpdates courseId={props.courseId}/>
                    },
                },
            ],
        },
        course_export_plugin_slot: {
            keepDefault: false,
            plugins: [
                {
                op: PLUGIN_OPERATIONS.Insert,
                widget: {
                    id: "course_export",
                    type: DIRECT_PLUGIN,
                    priority: 1,
                    RenderWidget: (props) => 
                        <CustomCourseExportPage courseId={props.courseId}/>
                    },
                },
            ],
        },
        courseoutline_header_plugin_slot: {
            keepDefault: false,
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: "course-content",
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: (props) => (
                            <h2 className='courseOutlineh2'>
                                <FormattedMessage
                                    id="course-authoring.course-outline.custom.heading"
                                    defaultMessage="Course Outline"
                                    description="Heading above the course sections in the custom course outline"
                                />
                            </h2>
                        ),
                    },
                },
            ],
        },
        course_export_stepper_plugin_slot: {
            keepDefault: false,
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: "course-stepper",
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: (props) => (
                            <div>
                                {props.index !== props.steps.length - 1 && (
                                    <span className="course-stepper__icon-line" />
                                )}
                            </div>
                        ),
                    },
                },
            ],
        },
        export_sidebar_plugin_slot: {
            keepDefault: false,
            plugins: [
                {
                op: PLUGIN_OPERATIONS.Insert,
                widget: {
                    id: "export_footer",
                    type: DIRECT_PLUGIN,
                    priority: 1,
                    RenderWidget: (props) => 
                        <CustomExportSidebar />
                    },
                },
            ],
        },
        files_page_plugin_slot: {
            keepDefault: false,
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: "files_page",
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: (props) => 
                            <CustomFilesPage courseId={props.courseId} />
                    },
                },
            ],
        },
        gallery_card_plugin_slot: {
            keepDefault: false,
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: "gallery_card",
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: (props) => (
                            <CustomGalleryCard
                                original={props.original}
                                handleBulkDownload={props.handleBulkDownload}
                                handleLockFile={props.handleLockFile}
                                handleOpenDeleteConfirmation={props.handleOpenDeleteConfirmation}
                                handleOpenFileInfo={props.handleOpenFileInfo}
                                thumbnailPreview={props.thumbnailPreview}
                                fileType={props.fileType}
                            />
                        ),
                    },
                },
            ],
        },
        pages_resources_plugin_slot: {
            keepDefault: false,
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: "pages_resources",
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: (props) => 
                        <CustomPagesAndResources courseId={props.courseId} />
                    },
                },
            ],
        },
        textbook_plugin_slot: {
            keepDefault: false,
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: "textbook",
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: (props) => 
                        <CustomTextbooks {...props} />
                    },
                },
            ],
        },
        custom_pages_plugin_slot: {
            keepDefault: false,
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: "custom_pages",
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: (props) => 
                        <CustomPagesNew {...props} />
                    },
                },
            ],
        },
        import_sidebar_plugin_slot: {
            keepDefault: false,
            plugins: [
                {
                op: PLUGIN_OPERATIONS.Insert,
                widget: {
                    id: "import_sidebar",
                    type: DIRECT_PLUGIN,
                    priority: 1,
                    RenderWidget: (props) =>
                        <CustomImportSidebar />
                    },
                },
            ],
        },
        course_update_card_plugin_slot: {
            keepDefault: false,
            plugins: [
                {
                op: PLUGIN_OPERATIONS.Insert,
                widget: {
                    id: "course_update_card",
                    type: DIRECT_PLUGIN,
                    priority: 1,
                    RenderWidget: (props) =>
                        <CustomCourseUpdate  {...props}/>
                    },
                },]},
        group_configurations_hide_plugin_slot: {
            keepDefault: false,
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Hide,
                }
            ],
        },
        group_config_header_plugin_slot: {
            keepDefault: false,
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: "certificates-content",
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: (props) => (
                            <div className="certificates-custom-header">
                                <div className="certificates-custom-sub-header">
                                    <div className="certificates-custom-sub-header-title">
                                        <SubHeader
                                            title={props.title}
                                            subtitle={props.subtitle}
                                            // headerActions={props.headerActions}
                                        />
                                    </div>
                                </div>
                                
                                <hr className='customHr' />

                            </div>
                        ),
                    },
                }
            ],
        },
        course_import_plugin_slot: {
            keepDefault: false,
            plugins: [
                {
                    op: PLUGIN_OPERATIONS.Insert,
                    widget: {
                        id: "course_import_plugin_slot",
                        type: DIRECT_PLUGIN,
                        priority: 1,
                        RenderWidget: (props) => 
                        <>
                            <span className="pages_bar" />
                            <div className="import-stepper-area">
                                <FileSection courseId={props.courseId} />
                                    <div className="import-stepper">
                                        {props.importTriggered && <ImportStepper courseId={props.courseId} />}
                                    </div>
                            </div>  
                        </>
                    },
                },
            ],
        },

  };
};

// Load environment variables from .env file
config.pluginSlots = getPluginSlots();

{% endraw %}
"""
     ))
