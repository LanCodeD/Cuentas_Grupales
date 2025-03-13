import { useLocalSearchParams } from "expo-router";
import { View, Text, FlatList,ScrollView, StyleSheet  } from "react-native";
import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase/config";

export default function Historial() {
  const { grupoID } = useLocalSearchParams();
  const [historial, setHistorial] = useState<
    { id: string; pagador: string; receptor?: string; monto: number; descripcion?: string; tipo: string }[]
  >([]);

  // 🔹 Obtener historial de pagos y gastos desde Firebase
  const obtenerHistorial = async () => {
    try {
      const historialRef = collection(db, `grupos/${grupoID}/historialPagos`);
      const q = query(historialRef, orderBy("fecha", "desc")); // Ordenado por fecha
      const snapshot = await getDocs(q);

      const listaHistorial = snapshot.docs.map(doc => {
        const data = doc.data() as {
          pagador: string;
          receptor?: string;
          monto: number;
          descripcion?: string;
          tipo: string;
        };
        return { id: doc.id, ...data };
      });

      setHistorial(listaHistorial);
    } catch (error) {
      console.error("❌ Error al obtener historial:", error);
    }
  };

  useEffect(() => {
    obtenerHistorial();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>📌 Historial de pagos del grupo</Text>

      {/* 🔹 Lista de movimientos del historial */}
      <FlatList
        data={historial}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.tipo === "Gasto" ? (
              <Text style={styles.texto}>
                💸 <Text style={styles.destacado}>{item.pagador}</Text> pagó <Text style={styles.monto}>${item.monto.toFixed(2)}</Text> por concepto de <Text style={styles.descripcion}>{item.descripcion || "un gasto"}</Text>.
              </Text>
            ) : (
              <Text style={styles.texto}>
                ✅ <Text style={styles.destacado}>{item.pagador}</Text> pagó su deuda de <Text style={styles.monto}>${item.monto.toFixed(2)}</Text> a <Text style={styles.destacado}>{item.receptor}</Text>.
              </Text>
            )}
          </View>
        )}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F8F9FA",
    flexGrow: 1,
  },
  titulo: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  card: {
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 12,
  },
  texto: {
    fontSize: 16,
  },
  destacado: {
    fontWeight: "bold",
    color: "#007BFF",
  },
  monto: {
    fontWeight: "bold",
    color: "#28A745",
  },
  descripcion: {
    fontStyle: "italic",
    color: "#555",
  },
});