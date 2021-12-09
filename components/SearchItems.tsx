import React from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'

import { useAppDispatch } from '../hooks/hooks'
import * as playerActions from '../store/actions/audioPlayer'
import * as trackActions from '../store/actions/track'
import { COLORS, FONTS } from '../constants'
import { RootStackParamList } from '../screens/RootStackParams'

interface ISearchItems {
  items: Array<ISearchItem>
  searchTerm?: string
}

interface ISearchItem {
  id: string
  type: string
  album: { images: Array<{ url: string }> }
  images: Array<{ url: string }>
  name: string
  artists: Array<{ name: string }>
  preview_url: string
  duration_ms: string
}

type searchItemsNavProps = StackNavigationProp<RootStackParamList, 'Search'>

const SearchItems = ({ items, searchTerm }: ISearchItems) => {
  const dispatch = useAppDispatch()
  const navigation = useNavigation<searchItemsNavProps>()

  const onSearchItemHandler = async (searchItemSelected: ISearchItem) => {
    const { type, id, preview_url, name, artists, album, duration_ms } =
      searchItemSelected
    if (type !== 'track') {
      navigation.navigate('Tracks', {
        mediaType: type,
        mediaId: id,
        artist: type === 'artist' ? searchItemSelected : null,
        isSearchItem: true,
      })
    } else {
      dispatch(playerActions.resetPlayer())
      dispatch(trackActions.setTrack(searchItemSelected))
      dispatch(playerActions.setTracks([searchItemSelected]))
      dispatch(
        playerActions.setCurrentTrack({
          id: id,
          url: preview_url,
          title: name,
          artist: artists.map((artist) => artist.name).join(', '),
          genre: '',
          date: '',
          artwork: album.images[0].url,
          duration: duration_ms,
          searchTerm,
        })
      )
      dispatch(playerActions.playTrack())
    }
  }
  return (
    <View>
      {items
        .filter((filteredItem) => filteredItem.preview_url !== null)
        .map((item, index) => {
          let albumImageUrl: string
          const isTrack = item.type === 'track'
          if (isTrack) {
            albumImageUrl = item.album.images[0].url
          } else {
            albumImageUrl =
              item.images && item.images.length > 0
                ? item.images[0].url
                : undefined
          }

          return (
            <TouchableOpacity
              key={`${item.id}-${index}`}
              onPress={() => onSearchItemHandler(item)}
              style={{ marginBottom: 15 }}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: 'row' }}>
                <View style={{ height: 40, width: 40, marginRight: 15 }}>
                  <Image
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: item.type === 'artist' ? 20 : 0,
                    }}
                    source={{
                      uri: albumImageUrl,
                    }}
                  />
                </View>
                <View>
                  <Text style={{ color: COLORS.white, ...FONTS.bodyBold }}>
                    {item.name}
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: COLORS.lightGray, ...FONTS.body }}>
                      {item.type === 'track' ? 'song' : item.type}
                    </Text>
                    {item.type !== 'artist' && item.type !== 'playlist' && (
                      <Text style={styles.bulletDot}>{'\u25CF'}</Text>
                    )}
                    {item.type !== 'artist' && item.type !== 'playlist' && (
                      <Text style={{ color: COLORS.lightGray, ...FONTS.body }}>
                        {item.artists.map((artist) => artist.name).join(', ')}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )
        })}
    </View>
  )
}

const styles = StyleSheet.create({
  bulletDot: { color: COLORS.lightGray, paddingHorizontal: 4, fontSize: 4 },
})

export default SearchItems
