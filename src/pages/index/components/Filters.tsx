import { memo } from 'react'
import { ScrollView, Text, View } from '@tarojs/components'
import TagChip from '../../../components/common/TagChip'

interface Props {
  filters: string[]
  activeFilter: number
  filterDropdownOpen: boolean
  onSelectFilter: (index: number) => void
  onToggleFilterDropdown: () => void
}

const Filters = memo(function Filters({
  filters, activeFilter, filterDropdownOpen,
  onSelectFilter, onToggleFilterDropdown,
}: Props) {
  return (
    <View className='home-filter-wrap'>
      <View className='home-filter-row'>
        <ScrollView scrollX showScrollbar={false} className='home-filter-scroll'>
          <View className='home-filter-list'>
            {filters.map((item, index) => (
              <TagChip
                key={item}
                text={item}
                active={activeFilter === index}
                type={activeFilter === index ? 'primary' : item === '\u70ed\u95e8' ? 'warning' : 'default'}
                onClick={() => onSelectFilter(index)}
              />
            ))}
          </View>
        </ScrollView>
        <View className={filterDropdownOpen ? 'home-filter-more home-filter-more--open' : 'home-filter-more'} onClick={onToggleFilterDropdown}>
          <Text>⌄</Text>
        </View>
      </View>
      {filterDropdownOpen ? (
        <View className='home-filter-dropdown'>
          {filters.map((item, index) => (
            <View
              key={`dropdown_${item}`}
              className={activeFilter === index ? 'home-filter-option home-filter-option--active' : 'home-filter-option'}
              onClick={() => onSelectFilter(index)}
            >
              <Text>{item}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  )
})

export default Filters
