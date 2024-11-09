import { useState, useCallback } from "react"
import { View, Image, TouchableOpacity, FlatList, Modal, Text, Alert, Linking } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { router, useFocusEffect } from "expo-router"

import { style } from "./styles"
import { colors } from "@/styles/colors"
import { categories } from "@/utils/categories"
import { linkStorage, LinkStorage} from "@/storage/link-storage"

import { Categories } from "@/components/categories"
import { Link } from "@/components/link"
import { Option } from "@/components/option"
import { openURL } from "expo-linking"

export default function Index() {
    const [showModal, setShowModal] = useState(false)
    const [link, setlink] = useState<LinkStorage>({} as LinkStorage)
    const [links, setLinks] = useState<LinkStorage[]>([])
    const [category, setCategory] = useState(categories[0].name)

    async function getLinks() {
        try {
            const response = await linkStorage.get()

            const filtered = response.filter((Link) => Link.category === category)

            setLinks(filtered)
        } catch (error) {
            Alert.alert("Erro", "Não foi possível listar os links")
        }  
    } 

    function handleDetails(selected: LinkStorage){
        setShowModal(true)
        setlink(selected)
    }

    async function linkRemove(){
        try {
            await linkStorage.remove(link.id)
            getLinks()
            setShowModal(false)
        } catch (error) {
            Alert.alert("Erro", "Não foi possível.")
            console.log(error)
        }
    }

    function handleRemove(){
        Alert.alert("Excluir", "Deseja realmente excluir?", [
            { style: "cancel", text: "Não" },
            { text: "Sim", onPress: linkRemove },
        ])
    }

    async function handleOpen(){
        try {
            await Linking,openURL(link.url)
            setShowModal(false)
            
        } catch (error) {
            Alert.alert("Link", "Não foi possível abri o link.")
            console.log(error)
        }
    }

    useFocusEffect(
        useCallback(() => {
            getLinks()
        }, [category])
    )

    return (
    <View style={style.container}>
        <View style={style.header}>
            <Image source={require("@/assets/logo.png")} style={style.logo} />

            <TouchableOpacity onPress={() => router.navigate("/add")}>
                <MaterialIcons name="add" size={32} color={colors.green[300]} />
            </TouchableOpacity>
        </View>

        <Categories onChange={setCategory} selected={category} /> 

        <FlatList
          data={links}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
        <Link 
          name={item.name}
          url={item.url}
          onDetails={() => handleDetails(item)}
        />
        )}
        style={style.links}
        contentContainerStyle={style.linksContent}
        showsVerticalScrollIndicator={false}
        />

        <Modal transparent visible={showModal} animationType="slide">
            <View style={style.modal}>
                <View style={style.modalContent}>
                    <View style={style.modalHeader}>
                        <Text style={style.modalCategory}>{link.category}</Text>

                        <TouchableOpacity onPress={() => setShowModal(false)}>
                        <MaterialIcons 
                        name="close" 
                        size={20} 
                        color={colors.gray[400]} />
                        </TouchableOpacity>
                    </View>

                    <Text style={style.modalLinkName}>
                        {link.name}
                    </Text>

                    <Text style={style.modalUrl}>{link.url}</Text>

                    <View style={style.modalFooter}>
                        <Option name="Excluir" icon="delete" variant="secondary" onPress={handleRemove} />
                        <Option name="Abrir" icon="language" onPress={handleOpen} />
                    </View>

                </View>

            </View>
        </Modal>
    </View>
    )
}
