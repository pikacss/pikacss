/**
 * TypeScript type definitions for mdn-data CSS data structures.
 *
 * These types describe the shape of JSON files exported by the `mdn-data` package
 * under `mdn-data/css`. They are used by codegen scripts and any code that works
 * with CSS metadata from MDN.
 *
 * @see https://github.com/mdn/data
 */

// ---------------------------------------------------------------------------
// Common enums
// ---------------------------------------------------------------------------

/** Specification status of a CSS feature. */
export type Status = 'standard' | 'nonstandard' | 'experimental' | 'obsolete'

/** How a CSS property value is animated during transitions/animations. */
export type AnimationType
	= | 'angleBasicShapeOrPath'
		| 'angleOrBasicShapeOrPath'
		| 'asIfPossibleOtherwiseDiscrete'
		| 'basicShapeOtherwiseNo'
		| 'byComputedValue'
		| 'byComputedValueType'
		| 'byComputedValueTypeNormalAnimatesAsObliqueZeroDeg'
		| 'byDynamicRangeLimitMix'
		| 'color'
		| 'discrete'
		| 'discreteButVisibleForDurationWhenAnimatedHidden'
		| 'discreteButVisibleForDurationWhenAnimatedNone'
		| 'eachOfShorthandPropertiesExceptUnicodeBiDiAndDirection'
		| 'filterList'
		| 'integer'
		| 'length'
		| 'lpc'
		| 'notAnimatable'
		| 'numberOrLength'
		| 'number'
		| 'position'
		| 'rectangle'
		| 'repeatableList'
		| 'shadowList'
		| 'simpleListOfLpc'
		| 'simpleListOfLpcDifferenceLpc'
		| 'superellipseInterpolation'
		| 'transform'
		| 'visibility'

/** How percentage values are interpreted for a CSS property. */
export type Percentages
	= | 'blockSizeOfContainingBlock'
		| 'convertedToNumber'
		| 'dependsOnLayoutModel'
		| 'inlineSizeOfContainingBlock'
		| 'lengthsAsPercentages'
		| 'logicalHeightOfContainingBlock'
		| 'logicalWidthOfContainingBlock'
		| 'logicalHeightOrWidthOfContainingBlock'
		| 'mapToRange0To1'
		| 'maxZoomFactor'
		| 'minZoomFactor'
		| 'no'
		| 'referToBorderBox'
		| 'referToContainingBlockHeight'
		| 'referToDimensionOfBorderBox'
		| 'referToDimensionOfContentArea'
		| 'referToElementFontSize'
		| 'referToFlexContainersInnerMainSize'
		| 'referToHeightOfBackgroundPositioningAreaMinusBackgroundImageHeight'
		| 'referToLineBoxWidth'
		| 'referToLineHeight'
		| 'referToParentElementsFontSize'
		| 'referToSizeOfBackgroundPositioningAreaMinusBackgroundImageSize'
		| 'referToSizeOfBorderImage'
		| 'referToSizeOfBoundingBox'
		| 'referToSizeOfContainingBlock'
		| 'referToSizeOfElement'
		| 'referToSizeOfFont'
		| 'referToSizeOfMaskBorderImage'
		| 'referToSizeOfMaskPaintingArea'
		| 'referToSVGViewportHeight'
		| 'referToSVGViewportSize'
		| 'referToSVGViewportWidth'
		| 'referToSVGViewportDiagonal'
		| 'referToTheUsedValueOfLineHeight'
		| 'referToTotalPathLength'
		| 'referToWidthAndHeightOfElement'
		| 'referToWidthOfAffectedGlyph'
		| 'referToWidthOfBackgroundPositioningAreaMinusBackgroundImageWidth'
		| 'referToWidthOfContainingBlock'
		| 'referToWidthOrHeightOfBorderImageArea'
		| 'referToReferenceBoxWhenSpecifiedOtherwiseBorderBox'
		| 'regardingHeightOfGeneratedBoxContainingBlockPercentages0'
		| 'regardingHeightOfGeneratedBoxContainingBlockPercentagesNone'
		| 'regardingHeightOfGeneratedBoxContainingBlockPercentagesRelativeToContainingBlock'
		| 'relativeToBackgroundPositioningArea'
		| 'relativeToCorrespondingDimensionOfRelevantScrollport'
		| 'relativeToMaskBorderImageArea'
		| 'relativeToScrollContainerPaddingBoxAxis'
		| 'relativeToTheScrollContainersScrollport'
		| 'relativeToTimelineRangeIfSpecifiedOtherwiseEntireTimeline'
		| 'relativeToWidthAndHeight'

/** How a CSS property's computed value is determined. */
export type Computed
	= | 'absoluteLength'
		| 'absoluteLength0ForNone'
		| 'absoluteLength0IfColumnRuleStyleNoneOrHidden'
		| 'absoluteLengthOr0IfBorderBottomStyleNoneOrHidden'
		| 'absoluteLengthOr0IfBorderLeftStyleNoneOrHidden'
		| 'absoluteLengthOr0IfBorderRightStyleNoneOrHidden'
		| 'absoluteLengthOr0IfBorderTopStyleNoneOrHidden'
		| 'absoluteLengthOrAsSpecified'
		| 'absoluteLengthOrKeyword'
		| 'absoluteLengthOrNone'
		| 'absoluteLengthOrNormal'
		| 'absoluteLengthOrPercentage'
		| 'absoluteLengthOrPercentageNumbersConverted'
		| 'absoluteLengthsSpecifiedColorAsSpecified'
		| 'absoluteLengthZeroIfBorderStyleNoneOrHidden'
		| 'absoluteLengthZeroOrLarger'
		| 'absoluteURIOrNone'
		| 'angleRoundedToNextQuarter'
		| 'asAutoOrColor'
		| 'asColorOrAbsoluteURL'
		| 'asDefinedForBasicShapeWithAbsoluteURIOtherwiseAsSpecified'
		| 'asLength'
		| 'asLonghands'
		| 'asSpecified'
		| 'asSpecifiedAppliesToEachProperty'
		| 'asSpecifiedButVisibleOrClipReplacedToAutoOrHiddenIfOtherValueDifferent'
		| 'asSpecifiedButWithPercentageConvertedToTheEquivalentNumber'
		| 'asSpecifiedExceptMatchParent'
		| 'asSpecifiedExceptPositionedFloatingAndRootElementsKeywordMaybeDifferent'
		| 'asSpecifiedRelativeToAbsoluteLengths'
		| 'asSpecifiedURLsAbsolute'
		| 'asSpecifiedWithExceptionOfResolution'
		| 'asSpecifiedWithLengthsAbsoluteAndNormalComputingToZeroExceptMultiColumn'
		| 'asSpecifiedWithLengthValuesComputed'
		| 'asSpecifiedWithVarsSubstituted'
		| 'autoOnAbsolutelyPositionedElementsValueOfAlignItemsOnParent'
		| 'autoOrRectangle'
		| 'autoOrAbsoluteLength'
		| 'colorPlusThreeAbsoluteLengths'
		| 'computedColor'
		| 'computedValueForDynamicRangeLimit'
		| 'consistsOfTwoDimensionKeywords'
		| 'consistsOfTwoKeywordsForOriginAndOffsets'
		| 'correspondingSuperellipse'
		| 'forLengthAbsoluteValueOtherwisePercentage'
		| 'autoForTranslucentColorRGBAOtherwiseRGB'
		| 'keywordOrNumericalValueBolderLighterTransformedToRealValue'
		| 'keywordPlusIntegerIfDigits'
		| 'lengthAbsolutePercentageAsSpecifiedOtherwiseAuto'
		| 'listEachItemConsistingOfAbsoluteLengthPercentageAndOrigin'
		| 'listEachItemConsistingOfAbsoluteLengthPercentageOrKeyword'
		| 'listEachItemConsistingOfNormalLengthPercentageOrNameLengthPercentage'
		| 'listEachItemConsistingOfPairsOfAutoOrLengthPercentage'
		| 'listEachItemHasTwoKeywordsOnePerDimension'
		| 'listEachItemIdentifierOrNoneAuto'
		| 'listEachItemTwoKeywordsOriginOffsets'
		| 'listOfNoneAutoIdentScrollOrView'
		| 'noneOrImageWithAbsoluteURI'
		| 'noneOrOrderedListOfIdentifiers'
		| 'normalizedAngle'
		| 'normalOnElementsForPseudosNoneAbsoluteURIStringOrAsSpecified'
		| 'normalOrComputedTime'
		| 'oneToFourPercentagesOrAbsoluteLengthsPlusFill'
		| 'optimumValueOfAbsoluteLengthOrNormal'
		| 'percentage'
		| 'percentageAsSpecifiedAbsoluteLengthOrNone'
		| 'percentageAsSpecifiedOrAbsoluteLength'
		| 'percentageAutoOrAbsoluteLength'
		| 'percentageOrAbsoluteLengthPlusKeywords'
		| 'sameAsBoxOffsets'
		| 'sameAsMaxWidthAndMaxHeight'
		| 'sameAsMinWidthAndMinHeight'
		| 'sameAsWidthAndHeight'
		| 'specifiedInteger'
		| 'specifiedIntegerOrAbsoluteLength'
		| 'specifiedKeywordOrComputedFunction'
		| 'specifiedValue'
		| 'specifiedValueClipped0To1'
		| 'specifiedValueNumberClipped0To1'
		| 'theComputedLengthAndVisualBox'
		| 'theKeywordListStyleImageNoneOrComputedValue'
		| 'theSpecifiedKeyword'
		| 'theSpecifiedKeywordOrAComputedLengthPercentageValue'
		| 'translucentValuesRGBAOtherwiseRGB'
		| 'twoAbsoluteLengthOrPercentages'
		| 'twoAbsoluteLengths'

/** Which elements a CSS property applies to. */
export type AppliesTo
	= | 'absolutelyPositionedElements'
		| 'allElements'
		| 'allElementsAcceptingWidthOrHeight'
		| 'allElementsAndPseudos'
		| 'allElementsAndText'
		| 'allElementsButNonReplacedAndTableColumns'
		| 'allElementsButNonReplacedAndTableRows'
		| 'allElementsCreatingNativeWindows'
		| 'allElementsExceptGeneratedContentOrPseudoElements'
		| 'allElementsExceptInlineBoxesAndInternalRubyOrTableBoxes'
		| 'allElementsExceptInternalTableDisplayTypes'
		| 'allElementsExceptNonReplacedInlineElementsTableRowsColumnsRowColumnGroups'
		| 'allElementsExceptTableDisplayTypes'
		| 'allElementsExceptTableElementsWhenCollapse'
		| 'allElementsExceptTableRowColumnGroupsTableRowsColumns'
		| 'allElementsExceptTableRowGroupsRowsColumnGroupsAndColumns'
		| 'allElementsNoEffectIfDisplayNone'
		| 'allElementsSomeValuesNoEffectOnNonInlineElements'
		| 'allElementsSVGContainerElements'
		| 'allElementsSVGContainerGraphicsAndGraphicsReferencingElements'
		| 'allElementsThatCanReferenceImages'
		| 'allElementsThatGenerateAPrincipalBox'
		| 'allElementsTreeAbidingPseudoElementsPageMarginBoxes'
		| 'allElementsUAsNotRequiredWhenCollapse'
		| 'anyElementEffectOnProgressAndMeter'
		| 'asLonghands'
		| 'beforeAndAfterPseudos'
		| 'blockContainerElements'
		| 'blockContainers'
		| 'blockContainersAndInlineBoxes'
		| 'blockContainersAndMultiColumnContainers'
		| 'blockContainersExceptMultiColumnContainers'
		| 'blockContainersExceptTableWrappers'
		| 'blockContainersFlexContainersGridContainers'
		| 'blockContainersFlexContainersGridContainersInlineBoxesTableRowsSVGTextContentElements'
		| 'blockContainersMultiColumnContainersFlexContainersGridContainers'
		| 'blockElementsInNormalFlow'
		| 'blockLevelElements'
		| 'blockLevelBoxesAndAbsolutelyPositionedBoxesAndGridItems'
		| 'boxElements'
		| 'childrenOfBoxElements'
		| 'directChildrenOfElementsWithDisplayMozBoxMozInlineBox'
		| 'elementsForWhichLayoutContainmentCanApply'
		| 'elementsForWhichSizeContainmentCanApply'
		| 'elementsThatAcceptInput'
		| 'elementsWithDefaultPreferredSize'
		| 'elementsWithDisplayBoxOrInlineBox'
		| 'elementsWithDisplayMarker'
		| 'elementsWithDisplayMozBoxMozInlineBox'
		| 'elementsWithOverflowNotVisibleAndReplacedElements'
		| 'exclusionElements'
		| 'firstLetterPseudoElementsAndInlineLevelFirstChildren'
		| 'flexContainers'
		| 'flexItemsAndAbsolutelyPositionedFlexContainerChildren'
		| 'flexItemsAndInFlowPseudos'
		| 'flexItemsGridItemsAbsolutelyPositionedContainerChildren'
		| 'flexItemsGridItemsAndAbsolutelyPositionedBoxes'
		| 'floats'
		| 'gridContainers'
		| 'gridContainersWithMasonryLayout'
		| 'gridContainersWithMasonryLayoutInTheirBlockAxis'
		| 'gridContainersWithMasonryLayoutInTheirInlineAxis'
		| 'gridItemsAndBoxesWithinGridContainer'
		| 'iframeElements'
		| 'images'
		| 'inFlowBlockLevelElements'
		| 'inlineBoxesAndBlockContainers'
		| 'inFlowChildrenOfBoxElements'
		| 'inlineLevelAndTableCellElements'
		| 'inlineLevelBoxes'
		| 'inlineLevelBoxesAndSVGTextContentElements'
		| 'inlineLevelBoxesFlexItemsGridItemsTableCellsAndSVGTextContentElements'
		| 'limitedSVGElements'
		| 'limitedSVGElementsCircle'
		| 'limitedSVGElementsEllipse'
		| 'limitedSVGElementsEllipseRect'
		| 'limitedSVGElementsFilterPrimitives'
		| 'limitedSVGElementsFloodAndDropShadow'
		| 'limitedSVGElementsGeometry'
		| 'limitedSVGElementsGraphics'
		| 'limitedSVGElementsGraphicsAndUse'
		| 'limitedSVGElementsLightSource'
		| 'limitedSVGElementsPath'
		| 'limitedSVGElementsShapes'
		| 'limitedSVGElementsShapesAndTextContent'
		| 'limitedSVGElementsShapeText'
		| 'limitedSVGElementsStop'
		| 'limitedSVGElementsTextContent'
		| 'listItems'
		| 'maskElements'
		| 'multicolElements'
		| 'multiColumnElementsFlexContainersGridContainers'
		| 'multilineFlexContainers'
		| 'nonReplacedBlockAndInlineBlockElements'
		| 'nonReplacedBlockElements'
		| 'nonReplacedElements'
		| 'nonReplacedInlineElements'
		| 'positionedElements'
		| 'positionedElementsWithADefaultAnchorElement'
		| 'replacedElements'
		| 'rubyAnnotationContainers'
		| 'rubyBasesAnnotationsBaseAnnotationContainers'
		| 'sameAsMargin'
		| 'sameAsWidthAndHeight'
		| 'scrollContainers'
		| 'scrollingBoxes'
		| 'tableCaptionElements'
		| 'tableCellElements'
		| 'tableElements'
		| 'textAndBlockContainers'
		| 'textAndSVGShapes'
		| 'textElements'
		| 'textOrElementsThatAcceptInput'
		| 'textFields'
		| 'transformableElements'

/** Media type a CSS property applies to. */
export type Media
	= | 'all'
		| 'aural'
		| 'continuous'
		| 'interactive'
		| 'none'
		| 'noPracticalMedia'
		| 'paged'
		| 'visual'
		| 'visualInContinuousMediaNoEffectInOverflowColumns'

/** Canonical ordering of a CSS property's values. */
export type Order
	= | 'canonicalOrder'
		| 'lengthOrPercentageBeforeKeywordIfBothPresent'
		| 'lengthOrPercentageBeforeKeywords'
		| 'oneOrTwoValuesLengthAbsoluteKeywordsPercentages'
		| 'orderOfAppearance'
		| 'percentagesOrLengthsFollowedByFill'
		| 'perGrammar'
		| 'uniqueOrder'

/** Pseudo-elements that a CSS property also applies to. */
export type AlsoAppliesTo = '::first-letter' | '::first-line' | '::placeholder'

// ---------------------------------------------------------------------------
// Data interfaces
// ---------------------------------------------------------------------------

/**
 * Shape of a single entry in `properties.json`.
 * Shorthand properties store arrays of sub-property names for certain fields.
 */
export interface CSSPropertyData {
	/** CSS value syntax definition (CSS Value Definition Syntax). */
	syntax: string
	/** Media type(s) the property applies to. */
	media?: Media | Media[]
	/** Whether the property is inherited by default. */
	inherited: boolean
	/** How the property animates. An array indicates delegation to sub-properties. */
	animationType: AnimationType | string[]
	/** How percentage values are interpreted. An array indicates delegation to sub-properties. */
	percentages: Percentages | string[]
	/** CSS specification group(s) this property belongs to. */
	groups: string[]
	/** Initial (default) value. An array lists sub-properties for shorthands. */
	initial: string | string[]
	/** Which elements the property applies to. */
	appliesto: AppliesTo
	/** Pseudo-elements the property additionally applies to. */
	alsoAppliesTo?: AlsoAppliesTo[]
	/** How the computed value is determined. An array indicates delegation to sub-properties. */
	computed: Computed | string[]
	/** Canonical ordering of values in the shorthand. */
	order: Order
	/** Whether the property creates a new stacking context. */
	stacking?: boolean
	/** Specification status. */
	status: Status
	/** MDN documentation URL. */
	mdn_url?: string
}

/**
 * Shape of a single entry in `syntaxes.json`.
 * Each key is a syntax name (e.g. `"<color>"`) and the value describes its formal syntax.
 */
export interface CSSSyntaxData {
	/** Formal CSS value syntax string. */
	syntax: string
}

/**
 * Shape of a single entry in `selectors.json`.
 */
export interface CSSSelectorData {
	/** Example or formal syntax of the selector. */
	syntax: string
	/** CSS specification group(s). */
	groups: string[]
	/** Specification status. */
	status: Status
	/** MDN documentation URL. */
	mdn_url?: string
}

/**
 * Shape of a descriptor entry within an at-rule's `descriptors` map.
 */
export interface CSSAtRuleDescriptorData {
	/** CSS value syntax for this descriptor. */
	syntax: string
	/** Media type(s). */
	media?: string | string[]
	/** Initial value. An array lists sub-descriptors. */
	initial: string | string[]
	/** How percentages are interpreted. An array lists sub-descriptors. */
	percentages: string | string[]
	/** How the computed value is determined. An array lists sub-descriptors. */
	computed: string | string[]
	/** Canonical ordering. */
	order: string
	/** Specification status. */
	status: Status
	/** MDN documentation URL. */
	mdn_url?: string
}

/**
 * Shape of a single entry in `at-rules.json`.
 */
export interface CSSAtRuleData {
	/** Formal syntax of the at-rule. */
	syntax: string
	/** CSSOM interface names (e.g. `"CSSFontFaceRule"`). */
	interfaces?: string[]
	/** CSS specification group(s). */
	groups: string[]
	/** Descriptors accepted within the at-rule block. */
	descriptors?: Record<string, CSSAtRuleDescriptorData>
	/** Specification status. */
	status: Status
	/** MDN documentation URL. */
	mdn_url?: string
}

/**
 * Shape of a single entry in `types.json`.
 */
export interface CSSTypeData {
	/** CSS specification group(s). */
	groups: string[]
	/** Specification status. */
	status: Status
	/** MDN documentation URL. */
	mdn_url?: string
}

/**
 * Shape of a single entry in `units.json`.
 */
export interface CSSUnitData {
	/** CSS specification group(s). */
	groups: string[]
	/** Specification status. */
	status: Status
}

/**
 * Shape of a single entry in `functions.json`.
 */
export interface CSSFunctionData {
	/** Formal syntax of the CSS function. */
	syntax: string
	/** CSS specification group(s). */
	groups: string[]
	/** Specification status. */
	status: Status
	/** MDN documentation URL. */
	mdn_url?: string
}

/**
 * The overall shape of `mdn-data/css` — the CSS data export.
 */
export interface CSSData {
	atRules: Record<string, CSSAtRuleData>
	functions: Record<string, CSSFunctionData>
	selectors: Record<string, CSSSelectorData>
	types: Record<string, CSSTypeData>
	properties: Record<string, CSSPropertyData>
	syntaxes: Record<string, CSSSyntaxData>
	units: Record<string, CSSUnitData>
}
