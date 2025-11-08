# =====================================================
# app/models.py — Definición de modelos de datos
# =====================================================

import uuid

class Node:
    """
    Representa una carpeta/nodo del árbol de documentos.
    Equivalente a cada objeto del JSON.
    """

    def __init__(self, name="Nueva carpeta", children=None, reviewed=False, collapsed=False, node_id=None):
        self.id = node_id or str(uuid.uuid4())
        self.name = name
        self.children = children or []
        self.reviewed = reviewed
        self.collapsed = collapsed

    def to_dict(self):
        """Convierte el nodo y sus hijos a diccionario."""
        return {
            "id": self.id,
            "name": self.name,
            "children": [c.to_dict() for c in self.children],
            "reviewed": self.reviewed,
            "collapsed": self.collapsed
        }

    @staticmethod
    def from_dict(data):
        """Crea un nodo desde un diccionario (recursivo)."""
        node = Node(
            name=data.get("name", "Nueva carpeta"),
            reviewed=data.get("reviewed", False),
            collapsed=data.get("collapsed", False),
            node_id=data.get("id")
        )
        node.children = [Node.from_dict(c) for c in data.get("children", [])]
        return node
